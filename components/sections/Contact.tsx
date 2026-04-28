'use client';

import { useState, type FormEvent } from 'react';
import { SITE, SERVICES } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';
import styles from './Contact.module.css';

interface FormState {
  name: string; phone: string; email: string; service: string; message: string;
}
type Status = 'idle' | 'loading' | 'success' | 'error';

const INIT: FormState = { name: '', phone: '', email: '', service: '', message: '' };

export default function Contact() {
  const [form,   setForm]   = useState<FormState>(INIT);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const update = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [k]: e.target.value }));
      setErrors(err => ({ ...err, [k]: undefined }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrors({});
    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { if (data.errors) setErrors(data.errors); setStatus('error'); return; }
      setStatus('success');
      setForm(INIT);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      {/* Left — info */}
      <div className={styles.info}>
        <Reveal><p className="eyebrow">Get In Touch</p></Reveal>
        <Reveal delay={120}>
          <h2 id="contact-title" className={styles.title}>
            Let&rsquo;s Build<br />
            <span className={styles.accent}>Something Great</span><br />
            Together
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className={styles.body}>
            Have a project in mind or need help scaling your infrastructure, AI systems,
            or cloud architecture? Our engineering team is ready to help you design,
            build, and launch faster.
          </p>
        </Reveal>

        <dl className={styles.details}>
          <Reveal delay={280}>
            <div className={styles.detail}>
              <dt className={styles.detailLabel}>Email</dt>
              <dd>
                <a href={`mailto:${SITE.email}`} className={styles.detailValue}>{SITE.email}</a>
              </dd>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className={styles.detail}>
              <dt className={styles.detailLabel}>Phone</dt>
              <dd>
                <a href={`tel:${SITE.phone}`} className={styles.detailValue}>{SITE.phone}</a>
              </dd>
            </div>
          </Reveal>
          <Reveal delay={360}>
            <div className={styles.detail}>
              <dt className={styles.detailLabel}>Location</dt>
              <dd className={styles.detailValue}>{SITE.location}</dd>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className={styles.detail}>
              <dt className={styles.detailLabel}>Response time</dt>
              <dd className={styles.detailValue}>Within 1 business day</dd>
            </div>
          </Reveal>
        </dl>

        <Reveal delay={460}>
          <div className={styles.badges}>
            {['DBA Support', 'DevOps & SecOps', 'AI Solutions', 'Argus Monitoring'].map(b => (
              <span key={b} className={styles.badge}>{b}</span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Right — form */}
      <Reveal delay={160} className={styles.formWrap}>
        <form onSubmit={handleSubmit} noValidate aria-label="Contact form" className={styles.form}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input id="name" type="text" className={`${styles.input} ${errors.name ? styles.inputErr : ''}`}
                placeholder="Jane Smith" value={form.name} onChange={update('name')} autoComplete="name" required />
              {errors.name && <p className={styles.fieldErr}>{errors.name}</p>}
            </div>
            <div className={styles.group}>
              <label htmlFor="phone" className={styles.label}>Phone Number</label>
              <input id="phone" type="tel" className={`${styles.input} ${errors.phone ? styles.inputErr : ''}`}
                placeholder="+1 416 000 0000" value={form.phone} onChange={update('phone')} autoComplete="tel" />
              {errors.phone && <p className={styles.fieldErr}>{errors.phone}</p>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input id="email" type="email" className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                placeholder="jane@company.com" value={form.email} onChange={update('email')} autoComplete="email" required />
              {errors.email && <p className={styles.fieldErr}>{errors.email}</p>}
            </div>
            <div className={styles.group}>
              <label htmlFor="service" className={styles.label}>Service of Interest</label>
              <select id="service" className={styles.select} value={form.service} onChange={update('service')}>
                <option value="">Select a service…</option>
                {SERVICES.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
                <option value="other">Other / Not sure yet</option>
              </select>
            </div>
          </div>

          <div className={styles.group}>
            <label htmlFor="message" className={styles.label}>Message</label>
            <textarea id="message" className={`${styles.textarea} ${errors.message ? styles.inputErr : ''}`}
              placeholder="Tell us about your project, goals, timeline, or any specific requirements…"
              value={form.message} onChange={update('message')} rows={5} required />
            {errors.message && <p className={styles.fieldErr}>{errors.message}</p>}
          </div>

          {status === 'error' && !Object.keys(errors).length && (
            <p className={styles.globalErr} role="alert">
              Something went wrong. Please try again or email us directly.
            </p>
          )}

          <button type="submit"
            className={`${styles.submit} ${status === 'loading' ? styles.loading : ''} ${status === 'success' ? styles.successBtn : ''}`}
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' && 'Sending…'}
            {status === 'success' && '✓ Message Received — We\'ll be in touch!'}
            {(status === 'idle' || status === 'error') && 'Send Message →'}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
