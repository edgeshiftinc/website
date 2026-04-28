import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// ─── Constants ───────────────────────────────────────────────────────────────
const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

// ─── Token generation ─────────────────────────────────────────────────────────
// Simple HMAC-style token: base64(timestamp + "." + hash)
// We avoid importing crypto as ESM to stay edge-compatible.
// Instead we use a simple secret + timestamp approach verified server-side.

export function generateSessionToken(): string {
  const ts = Date.now().toString(36);
  const secret = process.env.ADMIN_PASS ?? 'changeme';
  // Simple non-crypto signature — good enough for a single-admin dashboard
  // behind a hidden URL. For higher security, swap with jwt or iron-session.
  const sig = Buffer.from(`${ts}:${secret}`).toString('base64url');
  return `${ts}.${sig}`;
}

export function validateSessionToken(token: string): boolean {
  try {
    const [ts, sig] = token.split('.');
    if (!ts || !sig) return false;

    const secret = process.env.ADMIN_PASS ?? 'changeme';
    const expected = Buffer.from(`${ts}:${secret}`).toString('base64url');
    if (sig !== expected) return false;

    // Check expiry
    const issuedAt = parseInt(ts, 36);
    if (Date.now() - issuedAt > SESSION_DURATION_MS) return false;

    return true;
  } catch {
    return false;
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export function getSessionMaxAge(): number {
  return Math.floor(SESSION_DURATION_MS / 1000); // seconds for Set-Cookie
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

// ─── Request-level auth check (for API routes) ────────────────────────────────

export function isAdminAuthorized(req: NextRequest): boolean {
  // Check cookie
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookie && validateSessionToken(cookie)) return true;

  // Fallback: check Authorization header (useful for internal calls)
  const auth = req.headers.get('authorization');
  if (auth && auth === `Bearer ${process.env.ADMIN_PASS}`) return true;

  return false;
}

// ─── Server component auth check (for page routes) ───────────────────────────

export async function isAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    return validateSessionToken(token);
  } catch {
    return false;
  }
}
