/**
 * scripts/seed-services.mjs
 *
 * Seeds MongoDB with your existing static Services AND Argus product section.
 * Run ONCE after setting up the project:
 *
 *   node --env-file=.env.local scripts/seed-services.mjs
 *
 * Safe to re-run: skips any collection that already has data.
 */

import { MongoClient } from 'mongodb';

// ── Services ──────────────────────────────────────────────────────────────────
const SERVICES = [
  { title: 'DBA Support',                  tag: 'Database',    tagline: 'Expert database management, always on.',         description: 'Proactive and reactive database administration across all major platforms. We ensure your data layer is secure, performant, and always available — so your applications never skip a beat.',                                                                                                             highlights: ['Oracle, MSSQL, PostgreSQL, MySQL', 'Performance Tuning & Query Optimisation', 'Backup, Recovery & DR Planning', 'Database Migrations & Upgrades'],                                         order: 1, enabled: true },
  { title: 'AI Solutions',                 tag: 'AI',          tagline: 'Smarter systems. Bolder decisions.',              description: 'Transforming your business with purpose-built AI. From intelligent automation to predictive analytics and LLM-powered workflows, we design AI solutions that create measurable competitive advantage.',                                                                                              highlights: ['Predictive Analytics & Forecasting', 'Natural Language Processing (NLP)', 'MLOps & Model Deployment', 'LLM Integration & Prompt Engineering'],                                               order: 2, enabled: true },
  { title: 'DevOps & SecOps',              tag: 'DevOps',      tagline: 'Ship faster. Stay secure.',                       description: 'Intelligent DevOps automation paired with embedded security operations. We build CI/CD pipelines, cloud-native infrastructure, and security frameworks that accelerate delivery without compromise.',                                                                                              highlights: ['CI/CD Pipeline Automation', 'Cloud Infrastructure (AWS, Azure, GCP)', 'Container Orchestration (Kubernetes)', 'Security Compliance & Vulnerability Management'],                              order: 3, enabled: true },
  { title: 'Network & Security',           tag: 'Network',     tagline: 'Connected, protected, always.',                   description: 'End-to-end network design, deployment, and management. We handle new and existing network layouts with full OEM vendor support — keeping your infrastructure resilient and your perimeter defended.',                                                                                             highlights: ['LAN, WAN, WLAN, SDWAN (Multi-vendor)', 'ACI, F5, Firewall Management', 'Cisco & Juniper OEM Partnerships', 'Network Monitoring & Incident Response'],                                       order: 4, enabled: true },
  { title: 'Service Desk 24/7',            tag: 'Support',     tagline: 'Always available. Always helpful.',               description: 'Round-the-clock IT service desk support to keep your teams productive. With English and French language support (8AM–8PM), we are your first line of defence against downtime.',                                                                                                              highlights: ['24/7 Incident Management', 'English & French Support (8AM–8PM)', 'ITSM Ticketing & Escalation', 'SLA-Driven Response Commitments'],                                                          order: 5, enabled: true },
  { title: 'Infrastructure Observability', tag: 'Monitoring',  tagline: 'See everything. Miss nothing.',                   description: 'Real-time infrastructure observability powered by our Argus Monitoring Tool. Gain complete visibility across your stack — from application performance to network health and cloud costs.',                                                                                                       highlights: ['Argus Monitoring Platform', 'Real-Time Dashboards & Alerts', 'APM & Log Aggregation', 'Capacity Planning & Cost Optimisation'],                                                               order: 6, enabled: true },
];

// ── Argus Product Section ─────────────────────────────────────────────────────
const ARGUS_PRODUCT = {
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
  features: [
    { icon: '📡', title: 'Real-Time Monitoring',        desc: 'Continuous visibility across your entire infrastructure stack — from bare metal servers and VMs to containerised workloads and cloud services. Alerts fire in seconds, not minutes.' },
    { icon: '📊', title: 'Unified Dashboards',           desc: 'All your metrics, logs, and traces converge in a single pane of glass. Customisable dashboards give every team — from DevOps to leadership — the view they need.' },
    { icon: '🤖', title: 'AI-Powered Anomaly Detection', desc: 'Machine learning baselines normal behaviour and surfaces deviations before they escalate. Reduce alert fatigue and catch issues your threshold-based tools miss entirely.' },
    { icon: '🔗', title: 'Deep Integrations',            desc: 'Argus connects natively with your existing stack — PagerDuty, Slack, ServiceNow, Jira, Grafana, and more. No rip-and-replace; Argus fits around what you already use.' },
    { icon: '🔒', title: 'Security & Compliance',        desc: 'Built-in audit trails, role-based access control, and SOC 2-aligned data handling. Monitoring that satisfies your security team as much as your operations team.' },
    { icon: '⚡', title: 'Sub-Second Data Resolution',   desc: 'High-frequency telemetry collection with sub-second granularity. When milliseconds matter — and in production they always do — Argus gives you the resolution to act.' },
  ],
  stats: [
    { value: '<1s',   label: 'Alert Latency'   },
    { value: '99.9%', label: 'Platform Uptime' },
    { value: '200+',  label: 'Integrations'    },
    { value: '24/7',  label: 'Expert Support'  },
  ],
  order: 1,
  enabled: true,
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('ERROR: MONGODB_URI is not set.'); process.exit(1); }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('edgeshift');
    const now = new Date();

    // ── Seed services ──
    const serviceCol = db.collection('services');
    const existingServices = await serviceCol.countDocuments();
    if (existingServices > 0) {
      console.log(`⚠️  services: already has ${existingServices} documents, skipping.`);
    } else {
      const docs = SERVICES.map((s) => ({ ...s, createdAt: now, updatedAt: now }));
      const result = await serviceCol.insertMany(docs);
      console.log(`✅ services: seeded ${result.insertedCount} documents.`);
    }

    // ── Seed products (Argus) ──
    const productCol = db.collection('products');
    const existingProducts = await productCol.countDocuments();
    if (existingProducts > 0) {
      console.log(`⚠️  products: already has ${existingProducts} documents, skipping.`);
    } else {
      const result = await productCol.insertOne({ ...ARGUS_PRODUCT, createdAt: now, updatedAt: now });
      console.log(`✅ products: seeded Argus (id: ${result.insertedId}).`);
    }

    console.log('\nDone. You can now manage everything from /admin-panel.');
  } finally {
    await client.close();
  }
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
