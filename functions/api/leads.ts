/**
 * GET /api/leads — List leads (auth required via middleware)
 * Query params: status, source, limit, offset
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const status = url.searchParams.get('status');
  const source = url.searchParams.get('source');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = 'SELECT * FROM dmg_leads';
  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (status) { conditions.push('status = ?'); binds.push(status); }
  if (source) { conditions.push('source = ?'); binds.push(source); }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  binds.push(limit, offset);

  const leads = await context.env.DB.prepare(query).bind(...binds).all();

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM dmg_leads';
  if (conditions.length) countQuery += ' WHERE ' + conditions.join(' AND ');
  const countBinds = binds.slice(0, -2); // Remove limit/offset
  const total = await context.env.DB.prepare(countQuery).bind(...countBinds).first() as { total: number };

  return new Response(JSON.stringify({
    success: true,
    data: leads.results,
    total: total?.total ?? 0,
    limit,
    offset,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// PUT /api/leads — Update lead status
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { id: string; status?: string; assigned_to?: string; notes?: string };

    if (!body.id) {
      return new Response(JSON.stringify({ success: false, error: 'id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: string[] = ['updated_at = unixepoch()'];
    const binds: unknown[] = [];

    if (body.status) { updates.push('status = ?'); binds.push(body.status); }
    if (body.assigned_to) { updates.push('assigned_to = ?'); binds.push(body.assigned_to); }
    if (body.notes) { updates.push('notes = ?'); binds.push(body.notes); }

    binds.push(body.id);

    await context.env.DB.prepare(
      `UPDATE dmg_leads SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...binds).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
