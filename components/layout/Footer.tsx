import { SITE, NAV_LINKS, SERVICES } from '@/lib/data';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoEdge}>Edge</span>
            <span className={styles.logoShift}>shift</span>
            <span className={styles.logoTag}>Inc</span>
          </div>
          <p className={styles.tagline}>
            Your integrated technology partner — delivering resilient, scalable digital
            solutions through cloud DevOps, DBA support, AI solutions, and observability.
          </p>
          <a href={`mailto:${SITE.email}`} className={styles.footerEmail}>
            {SITE.email}
          </a>
          <a href={`tel:${SITE.phone}`} className={styles.footerEmail} style={{ marginTop: '4px' }}>
            {SITE.phone}
          </a>
        </div>

        {/* Navigation */}
        <div>
          <p className={styles.colTitle}>Navigation</p>
          <ul className={styles.linkList}>
            <li><a href="/" className={styles.footerLink}>Home</a></li>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className={styles.footerLink}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <p className={styles.colTitle}>Services</p>
          <ul className={styles.linkList}>
            {SERVICES.map(s => (
              <li key={s.id}>
                <a href="#services" className={styles.footerLink}>{s.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className={styles.colTitle}>Contact</p>
          <ul className={styles.linkList}>
            <li><a href={`mailto:${SITE.email}`} className={styles.footerLink}>{SITE.email}</a></li>
            <li><a href={`tel:${SITE.phone}`} className={styles.footerLink}>{SITE.phone}</a></li>
            <li className={styles.footerLink}>{SITE.location}</li>
            <li style={{ marginTop: '24px' }}>
              <a href="#contact" className={styles.footerCta}>Start a Project →</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <span className={styles.copy}>
          © {year} <span>{SITE.fullName}</span>. All rights reserved.
        </span>
        <span className={styles.copy}>
          Built in <span>Canada</span>
        </span>
      </div>
    </footer>
  );
}
