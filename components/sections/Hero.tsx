'use client';

import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const spacing = 48;
      const cols = Math.ceil(width  / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * spacing;
          const y = r * spacing;
          const dx = x - width  / 2;
          const dy = y - height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pulse = Math.sin(dist * 0.012 - t * 0.8) * 0.5 + 0.5;
          const alpha = pulse * 0.18 + 0.02;

          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 122, 26, ${alpha})`;
          ctx.fill();
        }
      }

      t += 0.04;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className={styles.hero} aria-label="Hero">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          DBA Support · AI Solutions · DevOps · Network & Security · Canada
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleLine1}>Your company needs great</span>
          <span className={styles.titleLine2}>
            software<span className={styles.titleAccent}> solutions.</span>
          </span>
          <span className={styles.titleLine3}>Let&rsquo;s build high-performing products.</span>
        </h1>

        <p className={styles.sub}>
          AI-Powered Engineering, Intelligent DevOps Automation, Proactive DBA Support,
          and Real-time Infrastructure Observability — Seamlessly Unified on one Enterprise Platform.
        </p>

        <div className={styles.actions}>
          <a href="#services" className={styles.btnPrimary}>
            <span>Explore Services</span>
            <span className={styles.btnArrow} aria-hidden="true">→</span>
          </a>
          <a href="#about" className={styles.btnGhost}>
            How we work
          </a>
        </div>

        <div className={styles.tags} aria-hidden="true">
          {['AI & ML', 'DevOps & SecOps', 'DBA Support', 'Argus Monitoring', 'Network & Security', 'Service Desk 24/7'].map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className={styles.scroll} aria-hidden="true">
        <div className={styles.scrollTrack}>
          <div className={styles.scrollThumb} />
        </div>
        <span>scroll</span>
      </div>
    </section>
  );
}