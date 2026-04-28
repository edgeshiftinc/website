import { NextRequest, NextResponse } from 'next/server';
import { validateContactForm, sanitize } from '@/lib/validation';
import { saveContactQuery } from '@/lib/models';
import { sendContactEmail } from '@/lib/emailService';

// ── In-process rate limiter — swap for Upstash Redis in multi-instance prod ──
const WINDOW_MS  = 60_000;
const MAX_REQS   = 5;
const ipStore    = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = ipStore.get(ip);
  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          ?? req.headers.get('x-real-ip')
          ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const { ok, errors } = validateContactForm(body);
  if (!ok) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // ── Save to MongoDB ──────────────────────────────────────────────────────
  try {
    await saveContactQuery({
      name: sanitize(body.name as string),
      email: sanitize(body.email as string),
      phone: sanitize(body.phone as string),
      service: sanitize(body.service as string),
      message: sanitize(body.message as string),
      ipAddress: ip,
    });
  } catch (error) {
    console.error('[contact] Failed to save query to MongoDB:', error);
    // Continue anyway - don't fail user request if DB is down
  }

  // ── Send email notification ──────────────────────────────────────────────
  try {
    const emailSent = await sendContactEmail({
      name: sanitize(body.name as string),
      email: sanitize(body.email as string),
      phone: sanitize(body.phone as string),
      service: sanitize(body.service as string),
      message: sanitize(body.message as string),
      ipAddress: ip,
    });

    if (!emailSent) {
      console.warn('[contact] Email service not configured or failed');
    }
  } catch (error) {
    console.error('[contact] Failed to send email:', error);
    // Continue anyway - don't fail user request if email service is down
  }

  console.info('[contact] New enquiry from', sanitize(body.email as string));

  return NextResponse.json(
    { ok: true, message: 'Thanks! We\'ll be in touch within one business day.' },
    { status: 200 }
  );
}

export async function GET() {
  return NextResponse.json({ ok: false, message: 'Method not allowed.' }, { status: 405 });
}
