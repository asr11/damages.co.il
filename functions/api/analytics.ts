/**
 * POST /api/analytics — Page view tracking (public, no auth)
 */

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as Record<string, unknown>;
    const ip = context.request.headers.get('CF-Connecting-IP') || '';
    const ua = context.request.headers.get('User-Agent') || '';

    await context.env.DB.prepare(`
      INSERT INTO dmg_pageviews (path, referrer, ip, ua, session_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      String(body.path || '/'),
      String(body.referrer || ''),
      ip,
      ua,
      String(body.session_id || '')
    ).run();

    // Also track specific events if provided
    if (body.event) {
      await context.env.DB.prepare(`
        INSERT INTO dmg_events (type, page, data, ip, session_id)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        String(body.event),
        String(body.path || '/'),
        JSON.stringify(body.data || {}),
        ip,
        String(body.session_id || '')
      ).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: true }), {
      status: 200, // Don't break client on analytics errors
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
