'use client';

import { useState } from 'react';
import { TESTIMONIALS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active];

  const prev = () => setActive(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setActive(i => (i + 1) % TESTIMONIALS.length);

  return (
    <section className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.inner}>
        <div className={styles.left}>
          <Reveal><p className="eyebrow">Social Proof</p></Reveal>
          <Reveal delay={120}>
            <h2 id="testimonials-title" className={styles.title}>
              What clients<br />
              <span className={styles.accent}>say about us</span>
            </h2>
          </Reveal>

          {/* Navigation */}
          <Reveal delay={240}>
            <div className={styles.nav}>
              <button className={styles.navBtn} onClick={prev} aria-label="Previous testimonial">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <div className={styles.counter}>
                <span className={styles.counterActive}>{String(active + 1).padStart(2, '0')}</span>
                <span className={styles.counterSep}>/</span>
                <span className={styles.counterTotal}>{String(TESTIMONIALS.length).padStart(2, '0')}</span>
              </div>
              <button className={styles.navBtn} onClick={next} aria-label="Next testimonial">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </Reveal>

          {/* Dot indicators */}
          <div className={styles.dots} role="tablist" aria-label="Testimonial indicators">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonial ${i + 1}`}
                className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>

        {/* Quote card */}
        <div className={styles.right}>
          <div className={styles.quoteCard} key={active}>
            <div className={styles.quoteIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <blockquote className={styles.quote}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className={styles.client}>
              <div className={styles.clientAvatar} aria-hidden="true">
                {t.company.charAt(0)}
              </div>
              <div>
                <p className={styles.clientName}>{t.company}</p>
                <p className={styles.clientRole}>{t.industry}</p>
              </div>
            </div>

            {/* Rating stars */}
            <div className={styles.stars} aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
