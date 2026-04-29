import Reveal from '@/components/ui/Reveal';
import styles from './About.module.css';

const FOCUS_ITEMS = [
  {
    num: '01',
    title: 'Integrated Expertise',
    desc: 'We eliminate the risk of vendor overlap by owning the entire software lifecycle — from cloud infrastructure and DevOps to database management and AI-driven intelligence.',
  },
  {
    num: '02',
    title: 'Engineered for Resilience',
    desc: 'Every solution we build is designed to scale, recover, and adapt. We engineer resilience into your systems from day one — not as an afterthought.',
  },
  {
    num: '03',
    title: 'Proactive Operations',
    desc: 'Our managed services model is built around prevention, not reaction. Real-time monitoring, automated alerts, and expert DBA teams keep your operations running without interruption.',
  },
  {
    num: '04',
    title: 'Business-Aligned Innovation',
    desc: 'At Edgeshift, technology is a catalyst for growth. We combine deep industry expertise with innovation to deliver solutions that align with your unique goals and future aspirations.',
  },
];

export default function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <Reveal>
            <p className="eyebrow">Who We Are</p>
          </Reveal>
          <Reveal delay={120}>
            <h2 id="about-title" className={styles.title}>
              AI, Cloud, DevOps, DBA &amp;{' '}
              <span className={styles.accent}>Observability</span>{' '}
              — one platform
            </h2>
          </Reveal>
        </div>

        <Reveal delay={200} className={styles.topRight}>
          <p className={styles.body}>
            <strong>Edgeshift Inc</strong> is your integrated technology partner, delivering
            resilient, scalable digital solutions through custom software engineering, managed
            cloud DevOps, expert DBA support, and Network availability &amp; observability.
          </p>
          <p className={styles.body} style={{ marginTop: '20px' }}>
            What sets us apart is our ability to blend technical excellence with business insight,
            ensuring every solution we deliver not only solves today&rsquo;s challenges but also
            scales for tomorrow&rsquo;s opportunities.
          </p>

          <div className={styles.pillRow}>
            <div className={styles.pill}>
              <span className={styles.pillIcon}>🎯</span>
              <div>
                <strong>Mission</strong>
                <p>Empower organisations with resilient, intelligent technology that drives real growth and lasting results.</p>
              </div>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillIcon}>🔭</span>
              <div>
                <strong>Vision</strong>
                <p>To be the most trusted integrated managed service provider, unifying engineering and operations on one enterprise platform.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className={styles.focusGrid}>
        {FOCUS_ITEMS.map((item, i) => (
          <Reveal key={item.num} delay={i * 100}>
            <div className={styles.focusCard}>
              <span className={styles.focusNum}>{item.num}</span>
              <h3 className={styles.focusTitle}>{item.title}</h3>
              <p className={styles.focusDesc}>{item.desc}</p>
              <div className={styles.focusLine} aria-hidden="true" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
