import { PROCESS_STEPS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';
import styles from './Process.module.css';

export default function Process() {
  return (
    <section id="process" className={styles.section} aria-labelledby="process-title">
      <div className={styles.header}>
        <Reveal><p className="eyebrow">How We Work</p></Reveal>
        <Reveal delay={120}>
          <h2 id="process-title" className={styles.title}>
            Our <span className={styles.accent}>Process</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className={styles.sub}>
            A proven four-stage framework that takes you from problem to production —
            with full transparency and measurable outcomes at every step.
          </p>
        </Reveal>
      </div>

      <div className={styles.steps}>
        {PROCESS_STEPS.map((step, i) => (
          <Reveal key={step.num} delay={i * 120}>
            <div className={styles.step}>
              {/* Connector line */}
              {i < PROCESS_STEPS.length - 1 && (
                <div className={styles.connector} aria-hidden="true">
                  <div className={styles.connectorLine} />
                  <div className={styles.connectorDot} />
                </div>
              )}

              <div className={styles.stepNum} aria-hidden="true">{step.num}</div>
              <div className={styles.stepBody}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Bottom CTA */}
      <Reveal delay={400}>
        <div className={styles.cta}>
          <p className={styles.ctaText}>
            Ready to start? Let&rsquo;s discuss your project.
          </p>
          <a href="#contact" className={styles.ctaBtn}>
            <span>Book a Discovery Call</span>
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
