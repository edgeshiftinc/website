# HOWE TechWorks — Next.js Website

A modern, modular, production-ready Next.js 14 website for HOWE TechWorks Ltd — IT consulting, AI/ML, digital marketing, web & mobile development, data analytics, and staff augmentation firm based in Markham, Ontario, Canada.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, file-based routing, built-in image optimisation |
| Language | TypeScript (strict) | Type safety, refactor confidence |
| Styling | CSS Modules | Scoped styles, zero runtime, no class conflicts |
| Fonts | next/font/google (Syne, DM Sans, JetBrains Mono) | Self-hosted, no layout shift |
| Animation | CSS + IntersectionObserver + Canvas | No heavy animation library needed |
| Security | next.config.js headers | CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy |

---

## Project Structure

```
howetw/
├── app/
│   ├── layout.tsx                  # Root layout — fonts, metadata, global CSS
│   ├── page.tsx                    # Home page — composes all sections
│   └── api/contact/route.ts        # POST /api/contact — validated, rate-limited
├── components/
│   ├── layout/
│   │   ├── Cursor.tsx/.module.css  # Custom cursor (desktop only)
│   │   ├── Navbar.tsx/.module.css  # Sticky nav with mobile overlay
│   │   └── Footer.tsx/.module.css  # Data-driven footer
│   ├── sections/
│   │   ├── Hero.tsx/.module.css         # Canvas dot-grid, glow orbs, staggered entry
│   │   ├── StatsBar.tsx/.module.css     # Animated gradient counters
│   │   ├── About.tsx/.module.css        # Mission/vision, business focus grid
│   │   ├── Services.tsx/.module.css     # 3-col service card grid with icons
│   │   ├── Process.tsx/.module.css      # 4-step process with grid texture bg
│   │   ├── Industries.tsx/.module.css   # Industry coverage grid
│   │   ├── Testimonials.tsx/.module.css # Interactive testimonial carousel
│   │   └── Contact.tsx/.module.css      # Controlled form with server validation
│   └── ui/
│       └── Reveal.tsx              # IntersectionObserver scroll reveal
├── lib/
│   ├── data.ts                     # ✦ Single source of truth — all content here
│   └── validation.ts               # Server-side validator + XSS sanitizer
├── styles/globals.css              # CSS design tokens + reset + shared utilities
├── .env.example                    # Safe env template
├── next.config.js                  # Security headers + image allowlist
└── README.md
```

---

## Getting Started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Run dev server
npm run dev
# → http://localhost:3000

# 4. Build for production
npm run build && npm run start
```

---

## Updating Content

**All content lives in `lib/data.ts` — one file, no hunting.**

```ts
// Add a service
SERVICES.push({
  id: 'salesforce',
  icon: 'consulting',
  tag: 'CRM',
  title: 'Salesforce Solutions',
  tagline: 'Smarter CRM. Stronger relationships.',
  description: 'Custom Salesforce implementations...',
  highlights: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Apex & LWC'],
});
```

---

## Security

### HTTP Security Headers (`next.config.js`)

| Header | Purpose |
|---|---|
| `Strict-Transport-Security` | Forces HTTPS for 2 years |
| `X-Frame-Options: SAMEORIGIN` | Prevents clickjacking |
| `X-Content-Type-Options: nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | Controls referrer data leakage |
| `Permissions-Policy` | Disables camera, mic, geolocation |
| `Content-Security-Policy` | Allowlists scripts, fonts, images |
| `X-Powered-By` disabled | Hides Next.js fingerprint |

### Contact API (`/api/contact`)

- POST-only (GET/PUT/DELETE → 405)
- In-memory rate limiting: 5 requests / IP / 60s
- Server-side input sanitization (strips HTML, XSS vectors)
- Structured error responses — no stack traces ever exposed
- All field lengths hard-capped server-side

### Upgrading Rate Limiting (production multi-instance)

```bash
npm install @upstash/ratelimit @upstash/redis
```

Replace `isRateLimited()` in `route.ts` with Upstash sliding window and add env vars.

---

## Adding Email Delivery

```bash
npm install resend
```

Uncomment the Resend block in `app/api/contact/route.ts` and set:

```env
RESEND_API_KEY=re_xxxx
CONTACT_EMAIL_TO=info@howetw.com
CONTACT_EMAIL_FROM=noreply@howetw.com
```

---

## Deploy

### Vercel (recommended)

```bash
npm i -g vercel && vercel
```

### Docker / VPS

```bash
npm run build
npm run start
# Put Nginx/Caddy in front for SSL
```
