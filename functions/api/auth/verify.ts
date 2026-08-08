/**
 * GET /api/auth/verify — Verify JWT and return user info (auth required via middleware)
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = (context as any).user;

  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    user: {
      id: user.sub,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
