// ─── Edgeshift Inc — Site Data ─────────────────────────────────────────────
// All content lives here. Edit this file to update any text on the site.

export const SITE = {
  name:        'Edgeshift Inc',
  fullName:    'Edgeshift Inc',
  tagline:     'Your Integrated Technology Partner',
  description: 'Integrated technology partner delivering resilient, scalable digital solutions through custom software engineering, managed cloud DevOps, expert DBA support, AI solutions, and Network availability & observability.',
  url:         process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.edgeshiftinc.com',
  email:       'info@edgeshiftinc.com',
  phone:       '+1 416 988 4682',
  location:    'Canada',
} as const;

export const NAV_LINKS = [
  { label: 'About',      href: '#about'       },
  { label: 'Services',   href: '#services'    },
  { label: 'Products',   href: '#argus'       },
  { label: 'Industries', href: '#industries'  },
  { label: 'Contact',    href: '#contact'     },
] as const;

export const STATS = [
  { value: 50,  suffix: '+', label: 'Projects Delivered'   },
  { value: 10,  suffix: '+', label: 'Years of Expertise'   },
  { value: 40,  suffix: '+', label: 'Enterprise Clients'   },
  { value: 99,  suffix: '%', label: 'Client Satisfaction'  },
] as const;

export interface Service {
  id:          string;
  icon:        'ai' | 'devops' | 'dba' | 'network' | 'servicedesk' | 'observability';
  tag:         string;
  title:       string;
  tagline:     string;
  description: string;
  highlights:  string[];
}

export const SERVICES: Service[] = [
  {
    id:          'dba-support',
    icon:        'dba',
    tag:         'Database',
    title:       'DBA Support',
    tagline:     'Expert database management, always on.',
    description: 'Proactive and reactive database administration across all major platforms. We ensure your data layer is secure, performant, and always available — so your applications never skip a beat.',
    highlights:  ['Oracle, MSSQL, PostgreSQL, MySQL', 'Performance Tuning & Query Optimisation', 'Backup, Recovery & DR Planning', 'Database Migrations & Upgrades'],
  },
  {
    id:          'ai-solutions',
    icon:        'ai',
    tag:         'Intelligence',
    title:       'AI Solutions',
    tagline:     'Smarter systems. Bolder decisions.',
    description: 'Transforming your business with purpose-built AI. From intelligent automation to predictive analytics and LLM-powered workflows, we design AI solutions that create measurable competitive advantage.',
    highlights:  ['Predictive Analytics & Forecasting', 'Natural Language Processing (NLP)', 'MLOps & Model Deployment', 'LLM Integration & Prompt Engineering'],
  },
  {
    id:          'devops-secops',
    icon:        'devops',
    tag:         'DevOps',
    title:       'DevOps & SecOps',
    tagline:     'Ship faster. Stay secure.',
    description: 'Intelligent DevOps automation paired with embedded security operations. We build CI/CD pipelines, cloud-native infrastructure, and security frameworks that accelerate delivery without compromise.',
    highlights:  ['CI/CD Pipeline Automation', 'Cloud Infrastructure (AWS, Azure, GCP)', 'Container Orchestration (Kubernetes)', 'Security Compliance & Vulnerability Management'],
  },
  {
    id:          'network-security',
    icon:        'network',
    tag:         'Network',
    title:       'Network & Security',
    tagline:     'Connected, protected, always.',
    description: 'End-to-end network design, deployment, and management. We handle new and existing network layouts with full OEM vendor support — keeping your infrastructure resilient and your perimeter defended.',
    highlights:  ['LAN, WAN, WLAN, SDWAN (Multi-vendor)', 'ACI, F5, Firewall Management', 'Cisco & Juniper OEM Partnerships', 'Network Monitoring & Incident Response'],
  },
  {
    id:          'service-desk',
    icon:        'servicedesk',
    tag:         'Support',
    title:       'Service Desk 24/7',
    tagline:     'Always available. Always helpful.',
    description: 'Round-the-clock IT service desk support to keep your teams productive. With English and French language support (8AM–8PM), we are your first line of defence against downtime.',
    highlights:  ['24/7 Incident Management', 'English & French Support (8AM–8PM)', 'ITSM Ticketing & Escalation', 'SLA-Driven Response Commitments'],
  },
  {
    id:          'observability',
    icon:        'observability',
    tag:         'Monitoring',
    title:       'Infrastructure Observability',
    tagline:     'See everything. Miss nothing.',
    description: 'Real-time infrastructure observability powered by our Argus Monitoring Tool. Gain complete visibility across your stack — from application performance to network health and cloud costs.',
    highlights:  ['Argus Monitoring Platform', 'Real-Time Dashboards & Alerts', 'APM & Log Aggregation', 'Capacity Planning & Cost Optimisation'],
  },
];

export interface ProcessStep {
  num:         string;
  title:       string;
  description: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    num:         '01',
    title:       'Discover',
    description: 'We work closely with you to understand your goals, technical constraints, and business opportunities. Deep listening and thorough assessment before any solution is proposed.',
  },
  {
    num:         '02',
    title:       'Strategise',
    description: 'Our team maps findings into a clear, actionable technology roadmap — split into milestones with measurable outcomes at each stage of delivery.',
  },
  {
    num:         '03',
    title:       'Build',
    description: 'Execution using best-in-class engineering practices, agile sprints, and continuous integration to deliver quality, resilient systems without cutting corners.',
  },
  {
    num:         '04',
    title:       'Launch & Scale',
    description: 'We deploy, monitor, and continuously optimise post-launch — ensuring your solution performs at scale and evolves alongside your business growth.',
  },
];

export interface Testimonial {
  company:  string;
  industry: string;
  quote:    string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    company:  'Enterprise Client',
    industry: 'Financial Services',
    quote:    'Edgeshift transformed our infrastructure from the ground up. Their DBA and DevOps teams worked seamlessly together, reducing our deployment times by over 60% while significantly improving system reliability. Truly an integrated partner.',
  },
  {
    company:  'Technology Partner',
    industry: 'Healthcare IT',
    quote:    'The observability platform Edgeshift delivered gave us visibility we never had before. We caught and resolved three critical issues before they impacted patients. Their proactive approach to managed services is second to none.',
  },
  {
    company:  'Global Enterprise',
    industry: 'Manufacturing & Logistics',
    quote:    'From network design to cloud migration and 24/7 service desk, Edgeshift handled our entire IT transformation. One trusted partner instead of six vendors — the difference in communication and accountability has been remarkable.',
  },
  {
    company:  'Scale-Up Client',
    industry: 'SaaS & Technology',
    quote:    'Their AI solutions team built a predictive analytics engine that our executives rely on daily. What impressed us most was how they translated complex ML concepts into business outcomes our leadership could immediately understand and act on.',
  },
];

export interface Industry {
  icon:  string;
  label: string;
}

export const INDUSTRIES: Industry[] = [
  { icon: '🏦', label: 'Financial Services'         },
  { icon: '🏥', label: 'Healthcare & Life Sciences'  },
  { icon: '🏭', label: 'Manufacturing & Retail'      },
  { icon: '📦', label: 'Logistics & Supply Chain'   },
  { icon: '☁️', label: 'SaaS & Technology'           },
  { icon: '🏛️', label: 'Government & Public Sector'  },
  { icon: '🎓', label: 'Education & Edtech'          },
  { icon: '💳', label: 'Fintech & Shared Services'  },
];