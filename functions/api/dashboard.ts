/**
 * GET /api/dashboard — Dashboard statistics (auth required)
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 86400;
  const oneWeekAgo = now - 7 * 86400;
  const thirtyDaysAgo = now - 30 * 86400;

  // Lead stats
  const totalLeads = await context.env.DB.prepare(
    'SELECT COUNT(*) as count FROM dmg_leads'
  ).first() as { count: number };

  const leadsToday = await context.env.DB.prepare(
    'SELECT COUNT(*) as count FROM dmg_leads WHERE created_at > ?'
  ).bind(oneDayAgo).first() as { count: number };

  const leadsWeek = await context.env.DB.prepare(
    'SELECT COUNT(*) as count FROM dmg_leads WHERE created_at > ?'
  ).bind(oneWeekAgo).first() as { count: number };

  const leadsMonth = await context.env.DB.prepare(
    'SELECT COUNT(*) as count FROM dmg_leads WHERE created_at > ?'
  ).bind(thirtyDaysAgo).first() as { count: number };

  // Leads by status
  const byStatus = await context.env.DB.prepare(
    'SELECT status, COUNT(*) as count FROM dmg_leads GROUP BY status'
  ).all();

  // Leads by source
  const bySource = await context.env.DB.prepare(
    'SELECT source, COUNT(*) as count FROM dmg_leads GROUP BY source ORDER BY count DESC'
  ).all();

  // Top pages (by lead generation)
  const topPages = await context.env.DB.prepare(
    'SELECT page, COUNT(*) as count FROM dmg_leads WHERE page != "" GROUP BY page ORDER BY count DESC LIMIT 10'
  ).all();

  // Page views today
  const viewsToday = await context.env.DB.prepare(
    'SELECT COUNT(*) as count FROM dmg_pageviews WHERE created_at > ?'
  ).bind(oneDayAgo).first() as { count: number };

  const viewsWeek = await context.env.DB.prepare(
    'SELECT COUNT(*) as count FROM dmg_pageviews WHERE created_at > ?'
  ).bind(oneWeekAgo).first() as { count: number };

  // Top viewed pages
  const topViewed = await context.env.DB.prepare(
    'SELECT path, COUNT(*) as views FROM dmg_pageviews WHERE created_at > ? GROUP BY path ORDER BY views DESC LIMIT 10'
  ).bind(oneWeekAgo).all();

  // Recent leads
  const recentLeads = await context.env.DB.prepare(
    'SELECT id, source, page, article, status, created_at FROM dmg_leads ORDER BY created_at DESC LIMIT 20'
  ).all();

  // Conversion rate (leads / pageviews this week)
  const conversionRate = viewsWeek?.count
    ? ((leadsWeek?.count || 0) / viewsWeek.count * 100).toFixed(2)
    : '0';

  return new Response(JSON.stringify({
    success: true,
    data: {
      summary: {
        total_leads: totalLeads?.count ?? 0,
        leads_today: leadsToday?.count ?? 0,
        leads_week: leadsWeek?.count ?? 0,
        leads_month: leadsMonth?.count ?? 0,
        views_today: viewsToday?.count ?? 0,
        views_week: viewsWeek?.count ?? 0,
        conversion_rate: conversionRate + '%',
      },
      by_status: byStatus.results,
      by_source: bySource.results,
      top_pages: topPages.results,
      top_viewed: topViewed.results,
      recent_leads: recentLeads.results,
      generated_at: new Date().toISOString(),
    },
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
