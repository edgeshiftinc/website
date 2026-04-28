// lib/emailService.ts
// ── Email via Resend ──────────────────────────────────────────────────────────
// Sends two emails on every enquiry:
//   1. Notification to Edgeshift team (internal)
//   2. Formal auto-reply to the person who submitted the form

import { ContactFormData } from './validation';

export async function sendContactEmail(
  data: ContactFormData & { ipAddress: string }
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not configured — skipping email');
    return false;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const toEmail   = process.env.RESEND_TO_EMAIL   || 'info@edgeshiftinc.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@edgeshiftinc.com';

  // Run both emails in parallel — if one fails, the other still sends
  const [notifyResult, replyResult] = await Promise.allSettled([
    sendInternalNotification(resend, data, toEmail, fromEmail),
    sendAutoReply(resend, data, fromEmail),
  ]);

  if (notifyResult.status === 'rejected') {
    console.error('[email] Internal notification failed:', notifyResult.reason);
  }
  if (replyResult.status === 'rejected') {
    console.error('[email] Auto-reply failed:', replyResult.reason);
  }

  // Return true as long as at least the notification went through
  return notifyResult.status === 'fulfilled' && notifyResult.value === true;
}

// ── 1. Internal notification to Edgeshift team ────────────────────────────────

async function sendInternalNotification(
  resend: import('resend').Resend,
  data: ContactFormData & { ipAddress: string },
  toEmail: string,
  fromEmail: string
): Promise<boolean> {
  const result = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: data.email,
    subject: `New Enquiry: ${data.name} — ${data.service || 'General'}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background: #f8fafc;">
          <div style="background: #111; padding: 20px 28px; border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: space-between;">
            <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">New Website Enquiry</h1>
            <span style="background: #f07a1a; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${escapeHtml(data.service) || 'General'}</span>
          </div>

          <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: 600; width: 110px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #f3f4f6;">Name</td>
                <td style="padding: 10px 0; font-size: 15px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(data.name)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #f3f4f6;">Email</td>
                <td style="padding: 10px 0; font-size: 15px; border-bottom: 1px solid #f3f4f6;">
                  <a href="mailto:${escapeHtml(data.email)}" style="color: #f07a1a; text-decoration: none;">${escapeHtml(data.email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #f3f4f6;">Phone</td>
                <td style="padding: 10px 0; font-size: 15px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(data.phone) || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Service</td>
                <td style="padding: 10px 0; font-size: 15px;">${escapeHtml(data.service) || '—'}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #f07a1a;">
              <p style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px;">Message</p>
              <p style="font-size: 15px; line-height: 1.75; margin: 0; color: #111; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
            </div>

            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Hit <strong>Reply</strong> to respond directly to ${escapeHtml(data.name)} at ${escapeHtml(data.email)}.
              </p>
              <p style="font-size: 11px; color: #d1d5db; margin: 6px 0 0;">Submitted from IP: ${data.ipAddress}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
NEW ENQUIRY — EDGESHIFT
========================
Name:    ${data.name}
Email:   ${data.email}
Phone:   ${data.phone || '—'}
Service: ${data.service || '—'}

Message:
${data.message}

---
Reply to this email to respond directly to the enquirer.
IP: ${data.ipAddress}
    `.trim(),
  });

  if (result.error) {
    console.error('[email] Internal notification error:', result.error);
    return false;
  }

  console.info('[email] Internal notification sent, ID:', result.data?.id);
  return true;
}

// ── 2. Formal auto-reply to the person who submitted the form ─────────────────

async function sendAutoReply(
  resend: import('resend').Resend,
  data: ContactFormData & { ipAddress: string },
  fromEmail: string
): Promise<boolean> {
  const firstName = data.name.split(' ')[0];

  const result = await resend.emails.send({
    from: fromEmail,
    to: data.email,
    subject: `Thank you for contacting Edgeshift, ${firstName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background: #f8fafc;">

          <div style="background: #111; padding: 24px 28px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">
              Edge<span style="color: #f07a1a;">shift</span> Inc
            </h1>
            <p style="color: #888; margin: 4px 0 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Infrastructure &amp; Technology Solutions</p>
          </div>

          <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 36px 28px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #111; margin: 0 0 20px;">Dear ${escapeHtml(firstName)},</p>

            <p style="font-size: 15px; line-height: 1.75; color: #374151; margin: 0 0 16px;">
              Thank you for reaching out to Edgeshift. We have received your enquiry and a member of our team will be in touch with you within <strong>one business day</strong>.
            </p>

            <p style="font-size: 15px; line-height: 1.75; color: #374151; margin: 0 0 28px;">
              For your reference, below is a summary of the information you submitted.
            </p>

            <!-- Submission summary -->
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px;">
              <p style="font-weight: 700; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 14px;">Your Submission</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; width: 100px; vertical-align: top;">Name</td>
                  <td style="padding: 6px 0; color: #111; font-weight: 500;">${escapeHtml(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Email</td>
                  <td style="padding: 6px 0; color: #111; font-weight: 500;">${escapeHtml(data.email)}</td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Phone</td>
                  <td style="padding: 6px 0; color: #111; font-weight: 500;">${escapeHtml(data.phone)}</td>
                </tr>` : ''}
                ${data.service ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Service</td>
                  <td style="padding: 6px 0; color: #111; font-weight: 500;">${escapeHtml(data.service)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Message</td>
                  <td style="padding: 6px 0; color: #111; font-weight: 500; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.message)}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 15px; line-height: 1.75; color: #374151; margin: 0 0 8px;">
              If you have any urgent questions in the meantime, you are welcome to reach us at
              <a href="mailto:info@edgeshiftinc.com" style="color: #f07a1a; text-decoration: none;">info@edgeshiftinc.com</a>
              or by phone at <a href="tel:+14169884682" style="color: #f07a1a; text-decoration: none;">+1 416 988 4682</a>.
            </p>

            <p style="font-size: 15px; line-height: 1.75; color: #374151; margin: 24px 0 0;">
              Kind regards,
            </p>
            <p style="font-size: 15px; color: #111; font-weight: 700; margin: 4px 0 2px;">The Edgeshift Team</p>
            <p style="font-size: 13px; color: #9ca3af; margin: 0;">
              Edgeshift Inc &nbsp;·&nbsp;
              <a href="https://www.edgeshiftinc.com" style="color: #9ca3af;">www.edgeshiftinc.com</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 16px 0; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">
              This is an automated confirmation. Please do not reply to this email.
            </p>
            <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0;">
              © ${new Date().getFullYear()} Edgeshift Inc. All rights reserved.
            </p>
          </div>

        </body>
      </html>
    `,
    text: `
Dear ${firstName},

Thank you for reaching out to Edgeshift. We have received your enquiry and a member of our team will be in touch with you within one business day.

YOUR SUBMISSION
---------------
Name:    ${data.name}
Email:   ${data.email}
${data.phone    ? `Phone:   ${data.phone}\n` : ''}\
${data.service  ? `Service: ${data.service}\n` : ''}\
Message: ${data.message}

If you have any urgent questions, please contact us at:
Email: info@edgeshiftinc.com
Phone: +1 416 988 4682

Kind regards,
The Edgeshift Team
www.edgeshiftinc.com

---
This is an automated confirmation. Please do not reply to this email.
© ${new Date().getFullYear()} Edgeshift Inc. All rights reserved.
    `.trim(),
  });

  if (result.error) {
    console.error('[email] Auto-reply error:', result.error);
    return false;
  }

  console.info('[email] Auto-reply sent to:', data.email, '| ID:', result.data?.id);
  return true;
}

// ── HTML escape helper ─────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}