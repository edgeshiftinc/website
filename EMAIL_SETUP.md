# Email Service Configuration Guide

This guide explains how to set up email notifications for contact form submissions.

## Option 1: Resend (Recommended for Next.js)

Resend is the easiest to set up and works great with Next.js applications.

### 1. Install Resend

```bash
npm install resend --legacy-peer-deps
```

### 2. Get Your API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **Settings** → **API Keys**
4. Copy your API key

### 3. Configure Environment Variables

Add to `.env.local`:
```
RESEND_API_KEY=your-api-key-here
RESEND_FROM_EMAIL=noreply@edgeshiftinc.com
RESEND_TO_EMAIL=info@edgeshiftinc.com
```

> **Note:** With the free tier, you can only send from `onboarding@resend.dev` initially. Contact Resend support to add your custom domain.

### 4. Use the Implementation

The implementation is ready in the file `lib/emailService.ts`. Just uncomment it in `app/api/contact/route.ts`.

---

## Option 2: SendGrid

A popular, enterprise-grade email service with a generous free tier.

### 1. Install SendGrid

```bash
npm install @sendgrid/mail --legacy-peer-deps
```

### 2. Get Your API Key

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Go to **Settings** → **API Keys**
4. Create a new API key and copy it

### 3. Configure Environment Variables

Add to `.env.local`:
```
SENDGRID_API_KEY=your-api-key-here
SENDGRID_FROM_EMAIL=noreply@edgeshiftinc.com
SENDGRID_TO_EMAIL=info@edgeshiftinc.com
```

### 4. Implementation

Replace the email service code in `app/api/contact/route.ts` with SendGrid implementation (example provided below).

---

## Option 3: Gmail + Nodemailer

Free email using your Gmail account (good for development/low volume).

### 1. Install Nodemailer

```bash
npm install nodemailer --legacy-peer-deps
```

### 2. Configure Gmail

1. Enable 2FA on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Copy the 16-character password

### 3. Configure Environment Variables

Add to `.env.local`:
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
CONTACT_EMAIL=info@edgeshiftinc.com
```

### 4. Implementation

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// In your contact route POST handler:
await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: process.env.CONTACT_EMAIL,
  subject: `New enquiry from ${body.name}`,
  text: `Name: ${body.name}\nPhone: ${body.phone}\nEmail: ${body.email}\nService: ${body.service}\n\n${body.message}`,
  replyTo: body.email,
});
```

---

## Quick Comparison

| Service | Free Tier | Setup Time | Best For |
|---------|-----------|-----------|----------|
| **Resend** | 100 emails/day | 5 min | Next.js apps (recommended) |
| **SendGrid** | 100 emails/day | 10 min | Scalable production apps |
| **Gmail** | Unlimited | 3 min | Development/testing |

---

## Testing Email Configuration

After setting up, test by:

1. Submit a contact form on your website
2. Check the email address in your config to verify the email arrives
3. If using Resend, check the email log at [dashboard.resend.com](https://dashboard.resend.com)

---

## Troubleshooting

**"Failed to send email but form was saved"**
- Check your API key in `.env.local`
- Verify it's the correct secret/key value
- For Resend: ensure you've verified your domain in settings

**"Email limit exceeded"**
- You've hit the free tier limit for the day
- Upgrade your plan or use a different service

**"Domain verification failed"**
- For Resend: use the default `onboarding@resend.dev` until your domain is verified
- For SendGrid: add your domain to verified senders in settings

