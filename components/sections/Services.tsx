// components/sections/Services.tsx
// ── Hybrid: fetches dynamic services from MongoDB.
//    Falls back to static SERVICES from lib/data.ts if DB returns nothing.
//    This means your existing hardcoded services still show if the DB is empty.

import { SERVICES, type Service } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';
import styles from './Services.module.css';

// ── Fetch DB services server-side ─────────────────────────────────────────────
// This runs on the server at request time (App Router server component).
// We use fetch with revalidation so changes from admin appear within ~60 seconds.

interface DbService {
  _id: string;
  title: string;
  tag: string;
  tagline: string;
  description: string;
  highlights: string[];
  order: number;
  enabled: boolean;
}

async function fetchDbServices(): Promise<DbService[]> {
  try {
    // IMPORTANT: In App Router server components, use the absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/services`, {
      next: { revalidate: 60 }, // ISR: re-fetch every 60 seconds
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.services ?? [];
  } catch {
    return [];
  }
}

// ── Map DB service → Service shape expected by ServiceCard ────────────────────
function dbToService(s: DbService): Service {
  // DB services don't have an icon field — default to 'ai'.
  // You can add an 'icon' field to ServiceDoc if you want full icon control.
  const iconMap: Record<string, Service['icon']> = {
    database: 'dba', dba: 'dba',
    ai: 'ai', intelligence: 'ai',
    devops: 'devops', secops: 'devops',
    network: 'network', security: 'network',
    support: 'servicedesk', desk: 'servicedesk',
    monitoring: 'observability', observability: 'observability',
  };
  const iconKey = s.tag?.toLowerCase() ?? '';
  const icon = Object.entries(iconMap).find(([k]) => iconKey.includes(k))?.[1] ?? 'ai';

  return {
    id: s._id,
    icon,
    tag: s.tag,
    title: s.title,
    tagline: s.tagline,
    description: s.description,
    highlights: s.highlights,
  };
}

// ── Inline SVG icons (unchanged from original) ────────────────────────────────
const ICONS: Record<Service['icon'], React.ReactNode> = {
  dba: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  devops: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </svg>
  ),
  servicedesk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  observability: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <Reveal delay={index * 80}>
      <article className={styles.card} aria-label={service.title}>
        <div className={styles.cardTop}>
          <div className={styles.iconWrap}>
            {ICONS[service.icon]}
          </div>
          <span className={styles.cardTag}>{service.tag}</span>
        </div>

        <h3 className={styles.cardTitle}>{service.title}</h3>
        <p className={styles.cardTagline}>{service.tagline}</p>
        <p className={styles.cardDesc}>{service.description}</p>

        <ul className={styles.highlights} aria-label="Highlights">
          {service.highlights.map((h) => (
            <li key={h} className={styles.highlight}>
              <span className={styles.hlDot} aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>

        <div className={styles.cardFooter}>
          <a href="#contact" className={styles.cardLink} aria-label={`Enquire about ${service.title}`}>
            Learn more
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <div className={styles.cardGlow} aria-hidden="true" />
        </div>
      </article>
    </Reveal>
  );
}

// ── Main export — async Server Component ──────────────────────────────────────
export default async function Services() {
  const dbServices = await fetchDbServices();

  // If DB has services → use them. If not → fall back to static data.
  // This means your site works on day one before anything is added to the DB.
  const displayServices: Service[] =
    dbServices.length > 0
      ? dbServices.map(dbToService)
      : SERVICES;

  return (
    <section id="services" className={styles.section} aria-labelledby="services-title">
      <div className={styles.header}>
        <div>
          <Reveal><p className="eyebrow">What We Offer</p></Reveal>
          <Reveal delay={120}>
            <h2 id="services-title" className={styles.title}>
              Our <span className={styles.accent}>Services</span>
            </h2>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <p className={styles.headerSub}>
            AI, Cloud Engineering, DevOps, DBA Support, Network, Security and Observability —
            come together in one platform and one trusted managed service provider.
          </p>
        </Reveal>
      </div>

      <div className={styles.grid}>
        {displayServices.map((s, i) => (
          <ServiceCard key={s.id} service={s} index={i} />
        ))}
      </div>
    </section>
  );
}
