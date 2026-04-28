// ─── Contact Form Validation ─────────────────────────────────────────────
// Runs SERVER-SIDE only. Never trust client-side validation alone.

export interface ContactFormData {
  name:    string;
  phone:   string;
  email:   string;
  service: string;
  message: string;
}

export interface ValidationResult {
  ok:     boolean;
  errors: Partial<Record<keyof ContactFormData, string>>;
}

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

/** Strips HTML / script tags to prevent XSS stored in logs or emails */
export function sanitize(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 2000);
}

export function validateContactForm(raw: Record<string, unknown>): ValidationResult {
  const errors: Partial<Record<keyof ContactFormData, string>> = {};

  const name    = sanitize(raw.name);
  const phone   = sanitize(raw.phone);
  const email   = sanitize(raw.email);
  const message = sanitize(raw.message);

  if (!name || name.length < 2)        errors.name    = 'Name must be at least 2 characters.';
  if (name.length > 120)               errors.name    = 'Name is too long.';
  if (!email || !EMAIL_RE.test(email)) errors.email   = 'A valid email address is required.';
  if (phone && !PHONE_RE.test(phone))  errors.phone   = 'Please enter a valid phone number.';
  if (!message || message.length < 10) errors.message = 'Message must be at least 10 characters.';
  if (message.length > 2000)           errors.message = 'Message must be under 2000 characters.';

  return { ok: Object.keys(errors).length === 0, errors };
}
