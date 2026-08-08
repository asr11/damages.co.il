/**
 * damages.co.il — Global Middleware
 * CORS headers + optional JWT auth check
 */

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  JWT_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

// Paths that require authentication
const AUTH_PATHS = ['/api/leads', '/api/dashboard', '/api/auth/verify'];

export const onRequest: PagesFunction<Env> = async (context) => {
  // CORS
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const url = new URL(context.request.url);

  // Check auth for protected paths
  if (AUTH_PATHS.some(p => url.pathname.startsWith(p))) {
    const token = getToken(context.request);
    if (!token) {
      return jsonError('Unauthorized', 401);
    }

    try {
      const payload = await verifyJWT(token, context.env.JWT_SECRET);
      // Attach user to context
      (context as any).user = payload;
    } catch {
      return jsonError('Invalid or expired token', 401);
    }
  }

  // Continue to next handler
  const response = await context.next();

  // Add CORS to response
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([k, v]) => newHeaders.set(k, v));

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
};

// ── Helpers ──────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function getToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);

  // Check cookie
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/dmg_token=([^;]+)/);
  return match ? match[1] : null;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// Simple JWT implementation (HMAC-SHA256)
async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown>> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) throw new Error('Invalid token');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

  const valid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!valid) throw new Error('Invalid signature');

  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

  // Check expiry
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}
