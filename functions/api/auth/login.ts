/**
 * POST /api/auth/login — Login with email + password → JWT
 */

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { email: string; password: string };

    if (!body.email || !body.password) {
      return jsonRes({ success: false, error: 'Email and password required' }, 400);
    }

    // Find user
    const user = await context.env.DB.prepare(
      'SELECT * FROM dmg_users WHERE email = ? AND status = ?'
    ).bind(body.email.toLowerCase().trim(), 'ACTIVE').first() as Record<string, unknown> | null;

    if (!user) {
      return jsonRes({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Verify password (simple hash comparison for now — bcrypt needs wasm)
    const passwordHash = await hashPassword(body.password);
    if (user.password !== passwordHash && user.password !== '$2a$10$placeholder_hash_change_me') {
      // Allow placeholder hash for initial setup
      if (body.password !== 'admin123' || user.password !== '$2a$10$placeholder_hash_change_me') {
        return jsonRes({ success: false, error: 'Invalid credentials' }, 401);
      }
    }

    // Generate JWT
    const token = await createJWT({
      sub: user.id as string,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string,
    }, context.env.JWT_SECRET, 86400 * 7); // 7 days

    // Update last login
    await context.env.DB.prepare(
      'UPDATE dmg_users SET last_login = unixepoch() WHERE id = ?'
    ).bind(user.id as string).run();

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `dmg_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${86400 * 7}`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    return jsonRes({ success: false, error: msg }, 500);
  }
};

function jsonRes(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_damages_salt_2026');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createJWT(payload: Record<string, unknown>, secret: string, expiresIn: number): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(fullPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${sigB64}`;
}
