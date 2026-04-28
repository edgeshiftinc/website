// components/sections/Argus.tsx
// ── Hybrid: fetches product sections from MongoDB.
//    Falls back to the hardcoded ARGUS data if the DB is empty.
//    Multiple product sections are supported — each renders as its own section.

import Reveal from '@/components/ui/Reveal';
import styles from './Argus.module.css';

// ── Static fallback data (your original Argus content) ────────────────────────
const STATIC_FEATURES = [
  { icon: '📡', title: 'Real-Time Monitoring',        desc: 'Continuous visibility across your entire infrastructure stack — from bare metal servers and VMs to containerised workloads and cloud services. Alerts fire in seconds, not minutes.' },
  { icon: '📊', title: 'Unified Dashboards',           desc: 'All your metrics, logs, and traces converge in a single pane of glass. Customisable dashboards give every team — from DevOps to leadership — the view they need.' },
  { icon: '🤖', title: 'AI-Powered Anomaly Detection', desc: 'Machine learning baselines normal behaviour and surfaces deviations before they escalate. Reduce alert fatigue and catch issues your threshold-based tools miss entirely.' },
  { icon: '🔗', title: 'Deep Integrations',            desc: 'Argus connects natively with your existing stack — PagerDuty, Slack, ServiceNow, Jira, Grafana, and more. No rip-and-replace; Argus fits around what you already use.' },
  { icon: '🔒', title: 'Security & Compliance',        desc: 'Built-in audit trails, role-based access control, and SOC 2-aligned data handling. Monitoring that satisfies your security team as much as your operations team.' },
  { icon: '⚡', title: 'Sub-Second Data Resolution',   desc: 'High-frequency telemetry collection with sub-second granularity. When milliseconds matter — and in production they always do — Argus gives you the resolution to act.' },
];

const STATIC_STATS = [
  { value: '<1s',   label: 'Alert Latency'   },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: '200+',  label: 'Integrations'    },
  { value: '24/7',  label: 'Expert Support'  },
];

const MOCK_BARS = [
  { label: 'CPU Usage',   fill: '62%', value: '62%'  },
  { label: 'Memory',      fill: '81%', value: '81%'  },
  { label: 'Network I/O', fill: '44%', value: '44%'  },
  { label: 'Disk I/O',    fill: '28%', value: '28%'  },
  { label: 'API Latency', fill: '91%', value: '91ms' },
];

const STATIC_ARGUS = {
  _id: 'static',
  slug: 'argus',
  eyebrow: 'Our Product',
  title: 'Meet ARGUS',
  titleAccent: 'ARGUS',
  subtitle: "Argus is Edgeshift\u2019s proprietary infrastructure monitoring platform \u2014 purpose-built to give enterprise teams complete, real-time observability across every layer of their technology stack. One tool. Total visibility.",
  heroCard: {
    label: 'Flagship Product',
    title: 'See everything.\nMiss nothing.',
    body: [
      "Built from the ground up by the Edgeshift engineering team, Argus delivers enterprise-grade monitoring without the enterprise-grade complexity. Whether you\u2019re running a hybrid cloud, a multi-region Kubernetes cluster, or a legacy on-premise estate, Argus gives your team the intelligence to act \u2014 fast.",
      "Note: This section contains placeholder content. Full product details, screenshots, and documentation will be added shortly.",
    ],
    ctaText: 'Request Early Access',
    ctaHref: '#contact',
  },
  features: STATIC_FEATURES,
  stats: STATIC_STATS,
  enabled: true,
};

// ── DB types (mirrors lib/models.ts) ─────────────────────────────────────────
interface DbProduct {
  _id: string;
  slug: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  heroCard: {
    label: string;
    title: string;
    body: string[];
    ctaText: string;
    ctaHref: string;
  };
  features: { icon: string; title: string; desc: string }[];
  stats: { value: string; label: string }[];
  enabled: boolean;
}

async function fetchDbProducts(): Promise<DbProduct[]> {
  try {
    const { getEnabledProducts } = await import('@/lib/models');
    const products = await getEnabledProducts();
    return products.map((p) => ({
      ...p,
      _id: p._id?.toString() ?? '',
    })) as DbProduct[];
  } catch (err) {
    console.error('[Argus] fetchDbProducts error:', err);
    return [];
  }
}

// ── Title renderer — splits title on accent word, wraps accent in orange span ─
// Uses case-insensitive split and auto-inserts a space before the accent if
// the author forgot to include one in the title string.

function renderTitle(title: string, accent: string, accentClass: string) {
  if (!accent || !accent.trim()) return <>{title}</>; // ← add .trim() check

  // Case-insensitive split, keep the matched part via capture group
  const parts = title.split(new RegExp(`(${accent})`, 'i'));

  return (
    <>
      {parts.map((part, i) => {
        const isAccent = part.toLowerCase() === accent.toLowerCase();
        if (!isAccent) return part;

        // If the previous part does not end with a space, add one so words
        // do not run together (e.g. "MeetARGUS" becomes "Meet ARGUS")
        const prev = parts[i - 1];
        const needsSpace = prev && !prev.endsWith(' ');

        return (
          <span key={i} className={accentClass}>
            {needsSpace ? ' ' : ''}{part}
          </span>
        );
      })}
    </>
  );
}

// ── Single product section renderer ──────────────────────────────────────────

function ProductSectionBlock({ product }: { product: DbProduct }) {
  return (
    <section id={product.slug} className={styles.section} aria-labelledby={`${product.slug}-title`}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <Reveal><p className="eyebrow">{product.eyebrow}</p></Reveal>
        <Reveal delay={120}>
          <h2 id={`${product.slug}-title`} className={styles.title}>
            {renderTitle(product.title, product.titleAccent, styles.accent)}
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className={styles.sub}>{product.subtitle}</p>
        </Reveal>
      </div>

      {/* ── Hero Card ── */}
      <Reveal delay={100}>
        <div className={styles.heroCard}>
          <div className={styles.heroCardContent}>
            <p className={styles.heroCardLabel}>{product.heroCard.label}</p>
            <h3 className={styles.heroCardTitle}>
              {product.heroCard.title.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h3>
            {product.heroCard.body.map((para, i) => (
              <p key={i} className={styles.heroCardText}>{para}</p>
            ))}
            <a href={product.heroCard.ctaHref} className={styles.heroCardCta}>
              <span>{product.heroCard.ctaText}</span>
              <span aria-hidden="true"> →</span>
            </a>
          </div>

          {/* Mock dashboard visual — always shown as decorative element */}
          <div className={styles.heroCardVisual} aria-hidden="true">
            {MOCK_BARS.map((bar) => (
              <div key={bar.label} className={styles.visualBar}>
                <span className={styles.visualLabel}>{bar.label}</span>
                <div className={styles.visualTrack}>
                  <div className={styles.visualFill} style={{ width: bar.fill }} />
                </div>
                <span className={styles.visualValue}>{bar.value}</span>
              </div>
            ))}
            <div className={styles.visualStatus}>
              <span className={styles.statusDot}>
                <span className={`${styles.dot} ${styles.green}`} />12 Healthy
              </span>
              <span className={styles.statusDot}>
                <span className={`${styles.dot} ${styles.orange}`} />2 Warning
              </span>
              <span className={styles.statusDot}>
                <span className={`${styles.dot} ${styles.blue}`} />Syncing
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Feature Grid ── */}
      {product.features.length > 0 && (
        <div className={styles.features}>
          {product.features.map((f, i) => (
            <Reveal key={`${f.title}-${i}`} delay={i * 80}>
              <div className={styles.featureCard}>
                <span className={styles.featureIcon} aria-hidden="true">{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* ── Stats Strip ── */}
      {product.stats.length > 0 && (
        <Reveal delay={200}>
          <div className={styles.statsStrip} aria-label={`${product.title} by the numbers`}>
            {product.stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default async function Argus() {
  const dbProducts = await fetchDbProducts();

  // If DB has products → use them. Otherwise fall back to static Argus.
  const products: DbProduct[] = dbProducts.length > 0 ? dbProducts : [STATIC_ARGUS];

  return (
    <>
      {products.map((p) => (
        <ProductSectionBlock key={p._id} product={p} />
      ))}
    </>
  );
}
