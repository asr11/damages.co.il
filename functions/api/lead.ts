/**
 * POST /api/lead — Lead ingestion (public, no auth)
 * Saves WhatsApp clicks, calculator submissions, form downloads
 * Sends Telegram alert on each new lead
 */

interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as Record<string, unknown>;

    const id = `lead_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const ip = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('X-Forwarded-For') || '';
    const ua = context.request.headers.get('User-Agent') || '';

    await context.env.DB.prepare(`
      INSERT INTO dmg_leads (id, source, page, article, referrer, ip, ua, phone, name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      String(body.source || 'unknown'),
      String(body.page || ''),
      String(body.article || ''),
      String(body.referrer || ''),
      ip,
      ua,
      String(body.phone || ''),
      String(body.name || '')
    ).run();

    // Send Telegram alert (non-blocking)
    context.waitUntil(sendTelegramAlert(context.env, {
      id,
      source: String(body.source || 'unknown'),
      page: String(body.page || '/'),
      article: String(body.article || ''),
    }));

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function sendTelegramAlert(env: Env, lead: Record<string, string>): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  const text = `🔔 *ליד חדש — damages.co.il*\n\n` +
    `📋 מקור: ${lead.source}\n` +
    `📄 עמוד: ${lead.page}\n` +
    `📰 מאמר: ${lead.article || '—'}\n` +
    `🆔 ${lead.id}\n` +
    `⏰ ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}`;

  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch { /* silent fail */ }
}
