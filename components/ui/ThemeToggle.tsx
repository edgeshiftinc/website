'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '6px 10px',
        color: 'var(--white)',
        fontSize: '16px',
        lineHeight: 1,
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}