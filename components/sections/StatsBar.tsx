'use client';

import { useEffect, useRef, useState } from 'react';
import { STATS } from '@/lib/data';
import styles from './StatsBar.module.css';

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal]   = useState(0);
  const ref             = useRef<HTMLSpanElement>(null);
  const started         = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const steps = 55;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const p = step / steps;
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setVal(Math.round(eased * target));
        if (step >= steps) clearInterval(timer);
      }, 1200 / steps);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref} className={styles.num}>{val}{suffix}</span>;
}

export default function StatsBar() {
  return (
    <div className={styles.bar}>
      {STATS.map((s, i) => (
        <div key={i} className={styles.item}>
          <Counter target={s.value} suffix={s.suffix} />
          <p className={styles.label}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
