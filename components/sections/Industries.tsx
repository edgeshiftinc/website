import { INDUSTRIES } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';
import styles from './Industries.module.css';

export default function Industries() {
  return (
    <section id="industries" className={styles.section} aria-labelledby="industries-title">
      <div className={styles.header}>
        <Reveal><p className="eyebrow">Sector Coverage</p></Reveal>
        <Reveal delay={120}>
          <h2 id="industries-title" className={styles.title}>
            Industries We <span className={styles.accent}>Support</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className={styles.sub}>
            Sector-specific services that improve consumer interaction and corporate
            processes — leveraging the latest technologies to give our clients a
            measurable competitive edge.
          </p>
        </Reveal>
      </div>

      <div className={styles.grid}>
        {INDUSTRIES.map((ind, i) => (
          <Reveal key={ind.label} delay={i * 60}>
            <div className={styles.card}>
              <span className={styles.icon} aria-hidden="true">{ind.icon}</span>
              <span className={styles.label}>{ind.label}</span>
              <div className={styles.cardLine} aria-hidden="true" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
