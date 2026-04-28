import { NextRequest, NextResponse } from 'next/server';
import {
  generateSessionToken,
  SESSION_COOKIE_NAME,
  getSessionMaxAge,
} from '@/lib/adminAuth';

// POST /api/admin/check
// Body: { password: string }
// Returns: { ok: boolean } + sets httpOnly cookie on success
export async function POST(req: NextRequest) {
  let body: { password?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass) {
    console.error('[admin/check] ADMIN_PASS env var is not set!');
    return NextResponse.json(
      { ok: false, message: 'Server misconfiguration.' },
      { status: 500 }
    );
  }

  if (!body.password || body.password !== adminPass) {
    // Add a small delay to slow down brute-force attempts
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(
      { ok: false, message: 'Incorrect password.' },
      { status: 401 }
    );
  }

  const token = generateSessionToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,     // not accessible via JS — protects against XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: getSessionMaxAge(),
    path: '/',
  });

  return res;
}

export async function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
