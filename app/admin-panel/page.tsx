'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceDoc {
  _id: string;
  title: string;
  tag: string;
  tagline: string;
  description: string;
  highlights: string[];
  order: number;
  enabled: boolean;
}

interface ProductFeature {
  icon: string;
  title: string;
  desc: string;
}

interface ProductStat {
  value: string;
  label: string;
}

interface ProductDoc {
  _id: string;
  slug: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  heroCard: {
    label: string;
    title: string;
    body: string[];
    ctaText: string;
    ctaHref: string;
  };
  features: ProductFeature[];
  stats: ProductStat[];
  order: number;
  enabled: boolean;
}

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
}

type Tab = 'services' | 'products' | 'enquiries';

// ─── Empty form states ────────────────────────────────────────────────────────

const EMPTY_SERVICE_FORM = {
  title: '', tag: '', tagline: '', description: '', highlights: '', order: '99', enabled: true,
};

const EMPTY_PRODUCT_FORM = {
  slug: '',
  eyebrow: 'Our Product',
  title: '',
  titleAccent: '',
  subtitle: '',
  heroLabel: 'Flagship Product',
  heroTitle: '',
  heroBody: '',
  heroCTAText: 'Request Early Access',
  heroCTAHref: '#contact',
  order: '99',
  enabled: true,
};

// ─── Root Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/admin/enquiries')
      .then((r) => { if (r.ok) setAuthed(true); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div style={css.center}><p style={{ color: '#888' }}>Loading…</p></div>;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}

// ─── Login Gate ───────────────────────────────────────────────────────────────

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.ok) onSuccess();
      else setError(data.message ?? 'Incorrect password.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={css.center}>
      <div style={css.loginBox}>
        <div style={css.loginLogo}>
          <span style={css.loginLogoText}>Edgeshift</span>
          <span style={css.loginLogoSub}>Admin</span>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="password" placeholder="Enter admin password" value={pw}
            onChange={(e) => setPw(e.target.value)} style={css.input} autoFocus required />
          {error && <p style={css.errorText}>{error}</p>}
          <button type="submit" disabled={loading} style={css.btnPrimary}>
            {loading ? 'Checking…' : 'Access Dashboard'}
          </button>
        </form>
        <p style={css.loginHint}>This page is not publicly accessible.</p>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const [tab, setTab] = useState<Tab>('services');

  return (
    <div style={css.dashWrap}>
      <aside style={css.sidebar}>
        <div style={css.sidebarBrand}>
          <span style={css.brandName}>Edgeshift</span>
          <span style={css.brandBadge}>Admin Panel</span>
        </div>
        <nav style={css.nav}>
          <button style={{ ...css.navBtn, ...(tab === 'services'  ? css.navBtnActive : {}) }} onClick={() => setTab('services')}>
            <span>📋</span> Services
          </button>
          <button style={{ ...css.navBtn, ...(tab === 'products'  ? css.navBtnActive : {}) }} onClick={() => setTab('products')}>
            <span>🚀</span> Products
          </button>
          <button style={{ ...css.navBtn, ...(tab === 'enquiries' ? css.navBtnActive : {}) }} onClick={() => setTab('enquiries')}>
            <span>📩</span> Enquiries
          </button>
        </nav>
        <button onClick={() => { document.cookie = 'admin_session=; Max-Age=0; path=/'; window.location.reload(); }} style={css.logoutBtn}>
          Sign Out
        </button>
      </aside>
      <main style={css.main}>
        {tab === 'services'  && <ServicesManager />}
        {tab === 'products'  && <ProductsManager />}
        {tab === 'enquiries' && <EnquiriesViewer />}
      </main>
    </div>
  );
}

// ─── Services Manager ─────────────────────────────────────────────────────────

function ServicesManager() {
  const [services, setServices] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceDoc | null>(null);
  const [form, setForm] = useState(EMPTY_SERVICE_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.ok) setServices(data.services);
    } catch { setMsg({ type: 'err', text: 'Failed to load services.' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditTarget(null); setForm(EMPTY_SERVICE_FORM); setShowForm(true); setMsg(null); }
  function openEdit(s: ServiceDoc) {
    setEditTarget(s);
    setForm({ title: s.title, tag: s.tag, tagline: s.tagline, description: s.description, highlights: s.highlights.join('\n'), order: String(s.order), enabled: s.enabled });
    setShowForm(true); setMsg(null);
  }
  function cancel() { setShowForm(false); setEditTarget(null); setForm(EMPTY_SERVICE_FORM); setMsg(null); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg(null);
    const payload = { ...form, order: parseInt(form.order, 10) || 99, ...(editTarget ? { id: editTarget._id } : {}) };
    try {
      const res = await fetch('/api/admin/services', { method: editTarget ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.ok) { setMsg({ type: 'ok', text: editTarget ? 'Service updated!' : 'Service added!' }); cancel(); load(); }
      else setMsg({ type: 'err', text: data.message ?? 'Save failed.' });
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.ok) { setMsg({ type: 'ok', text: 'Deleted.' }); load(); }
      else setMsg({ type: 'err', text: data.message ?? 'Delete failed.' });
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
  }

  async function handleToggle(s: ServiceDoc) {
    try {
      const res = await fetch('/api/admin/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s._id, enabled: !s.enabled }) });
      const data = await res.json();
      if (data.ok) load(); else setMsg({ type: 'err', text: data.message ?? 'Toggle failed.' });
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
  }

  return (
    <div>
      <div style={css.pageHeader}>
        <div>
          <h1 style={css.pageTitle}>Services</h1>
          <p style={css.pageSubtitle}>Manage the services shown in the Services section of your website.</p>
        </div>
        <button onClick={openAdd} style={css.btnPrimary}>+ Add Service</button>
      </div>

      {msg && <div style={msg.type === 'ok' ? css.alertOk : css.alertErr}>{msg.text}</div>}

      {showForm && (
        <div style={css.formCard}>
          <h2 style={css.formTitle}>{editTarget ? `Editing: ${editTarget.title}` : 'New Service'}</h2>
          <form onSubmit={handleSave} style={css.formGrid}>
            <div style={css.formGroup}>
              <label style={css.label}>Title *</label>
              <input style={css.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. DBA Support" required />
            </div>
            <div style={css.formGroup}>
              <label style={css.label}>Tag (category label)</label>
              <input style={css.input} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Database" />
            </div>
            <div style={{ ...css.formGroup, gridColumn: '1 / -1' }}>
              <label style={css.label}>Tagline</label>
              <input style={css.input} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. Expert database management, always on." />
            </div>
            <div style={{ ...css.formGroup, gridColumn: '1 / -1' }}>
              <label style={css.label}>Description *</label>
              <textarea style={{ ...css.input, ...css.textarea }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the service in 2–3 sentences." required />
            </div>
            <div style={{ ...css.formGroup, gridColumn: '1 / -1' }}>
              <label style={css.label}>Highlights (one per line)</label>
              <textarea style={{ ...css.input, ...css.textareaLg }} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder={"Oracle, MSSQL, PostgreSQL\nPerformance Tuning\nBackup & Recovery"} />
              <span style={css.hint}>Each line becomes one bullet point.</span>
            </div>
            <div style={css.formGroup}>
              <label style={css.label}>Display Order</label>
              <input type="number" style={css.input} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="1" />
            </div>
            <div style={{ ...css.formGroup, alignSelf: 'end' }}>
              <label style={css.checkboxLabel}>
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} style={{ marginRight: 8 }} />
                Visible on website
              </label>
            </div>
            <div style={{ ...css.formActions, gridColumn: '1 / -1' }}>
              <button type="submit" disabled={saving} style={css.btnPrimary}>{saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Service'}</button>
              <button type="button" onClick={cancel} style={css.btnSecondary}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p style={css.emptyMsg}>Loading…</p> : services.length === 0 ? (
        <div style={css.emptyCard}><p style={css.emptyMsg}>No services yet. Click <strong>+ Add Service</strong> to get started.</p></div>
      ) : (
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead><tr>
              <th style={css.th}>Title</th>
              <th style={css.th}>Tag</th>
              <th style={css.th}>Order</th>
              <th style={css.th}>Visible</th>
              <th style={css.th}>Actions</th>
            </tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s._id} style={css.tr}>
                  <td style={css.td}><strong>{s.title}</strong><br /><span style={css.subText}>{s.tagline}</span></td>
                  <td style={css.td}><span style={css.badge}>{s.tag || '—'}</span></td>
                  <td style={css.td}>{s.order}</td>
                  <td style={css.td}>
                    <button onClick={() => handleToggle(s)} style={s.enabled ? css.toggleOn : css.toggleOff}>
                      {s.enabled ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td style={css.td}>
                    <div style={css.actionGroup}>
                      <button onClick={() => openEdit(s)} style={css.btnEdit}>Edit</button>
                      <button onClick={() => handleDelete(s._id, s.title)} style={css.btnDelete}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Products Manager ─────────────────────────────────────────────────────────

function ProductsManager() {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'edit-basic' | 'edit-features' | 'edit-stats' | 'add'>('list');
  const [editTarget, setEditTarget] = useState<ProductDoc | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [stats, setStats] = useState<ProductStat[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.ok) setProducts(data.products);
    } catch { setMsg({ type: 'err', text: 'Failed to load products.' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_PRODUCT_FORM);
    setFeatures([{ icon: '📡', title: '', desc: '' }]);
    setStats([{ value: '', label: '' }]);
    setView('add');
    setMsg(null);
  }

  function openEdit(p: ProductDoc) {
    setEditTarget(p);
    setForm({
      slug: p.slug,
      eyebrow: p.eyebrow,
      title: p.title,
      titleAccent: p.titleAccent,
      subtitle: p.subtitle,
      heroLabel: p.heroCard.label,
      heroTitle: p.heroCard.title,
      heroBody: p.heroCard.body.join('\n\n'),
      heroCTAText: p.heroCard.ctaText,
      heroCTAHref: p.heroCard.ctaHref,
      order: String(p.order),
      enabled: p.enabled,
    });
    setFeatures(p.features.length > 0 ? [...p.features] : [{ icon: '', title: '', desc: '' }]);
    setStats(p.stats.length > 0 ? [...p.stats] : [{ value: '', label: '' }]);
    setView('edit-basic');
    setMsg(null);
  }

  function cancelAll() { setView('list'); setEditTarget(null); setMsg(null); }

  async function saveAll() {
    setSaving(true); setMsg(null);
    const payload = {
      ...(editTarget ? { id: editTarget._id } : {}),
      slug: form.slug,
      eyebrow: form.eyebrow,
      title: form.title,
      titleAccent: form.titleAccent,
      subtitle: form.subtitle,
      heroCard: {
        label: form.heroLabel,
        title: form.heroTitle,
        body: form.heroBody.split('\n\n').map(s => s.trim()).filter(Boolean),
        ctaText: form.heroCTAText,
        ctaHref: form.heroCTAHref,
      },
      features: features.filter(f => f.title.trim()),
      stats: stats.filter(s => s.value.trim()),
      order: parseInt(form.order, 10) || 99,
      enabled: form.enabled,
    };
    try {
      const res = await fetch('/api/admin/products', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) { setMsg({ type: 'ok', text: editTarget ? 'Product section updated!' : 'Product section created!' }); cancelAll(); load(); }
      else setMsg({ type: 'err', text: data.message ?? 'Save failed.' });
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete the "${title}" product section? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.ok) { setMsg({ type: 'ok', text: 'Deleted.' }); load(); }
      else setMsg({ type: 'err', text: data.message ?? 'Delete failed.' });
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
  }

  async function handleToggle(p: ProductDoc) {
    try {
      const res = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p._id, enabled: !p.enabled }) });
      const data = await res.json();
      if (data.ok) load(); else setMsg({ type: 'err', text: data.message ?? 'Toggle failed.' });
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
  }

  // Feature helpers
  function updateFeature(i: number, field: keyof ProductFeature, val: string) {
    const next = [...features]; next[i] = { ...next[i], [field]: val }; setFeatures(next);
  }
  function addFeature() { setFeatures([...features, { icon: '⭐', title: '', desc: '' }]); }
  function removeFeature(i: number) { setFeatures(features.filter((_, idx) => idx !== i)); }

  // Stat helpers
  function updateStat(i: number, field: keyof ProductStat, val: string) {
    const next = [...stats]; next[i] = { ...next[i], [field]: val }; setStats(next);
  }
  function addStat() { setStats([...stats, { value: '', label: '' }]); }
  function removeStat(i: number) { setStats(stats.filter((_, idx) => idx !== i)); }

  // ── Sub-views ──

  const isEditing = view === 'edit-basic' || view === 'edit-features' || view === 'edit-stats' || view === 'add';
  const editingTitle = editTarget ? editTarget.title : 'New Product Section';

  if (isEditing) {
    const subTabs = view === 'add'
      ? ['add' as const]
      : ['edit-basic', 'edit-features', 'edit-stats'] as const;

    return (
      <div>
        <div style={css.pageHeader}>
          <div>
            <h1 style={css.pageTitle}>{editTarget ? `Editing: ${editingTitle}` : 'New Product Section'}</h1>
            <p style={css.pageSubtitle}>Fill in all three tabs, then click Save.</p>
          </div>
          <div style={css.actionGroup}>
            <button onClick={saveAll} disabled={saving} style={css.btnPrimary}>{saving ? 'Saving…' : 'Save Product Section'}</button>
            <button onClick={cancelAll} style={css.btnSecondary}>Cancel</button>
          </div>
        </div>

        {msg && <div style={msg.type === 'ok' ? css.alertOk : css.alertErr}>{msg.text}</div>}

        {/* Step tabs for edit mode */}
        {view !== 'add' && (
          <div style={css.stepTabs}>
            <button style={{ ...css.stepTab, ...(view === 'edit-basic' ? css.stepTabActive : {}) }} onClick={() => setView('edit-basic')}>1. Basic Info & Hero</button>
            <button style={{ ...css.stepTab, ...(view === 'edit-features' ? css.stepTabActive : {}) }} onClick={() => setView('edit-features')}>2. Feature Cards</button>
            <button style={{ ...css.stepTab, ...(view === 'edit-stats' ? css.stepTabActive : {}) }} onClick={() => setView('edit-stats')}>3. Stats Strip</button>
          </div>
        )}

        {/* ── Basic Info + Hero Card ── */}
        {(view === 'edit-basic' || view === 'add') && (
          <div style={css.formCard}>
            {view === 'add' && <p style={css.sectionNote}>Fill in the details below. After saving, you can edit features and stats from the product list.</p>}

            <h3 style={css.subHeading}>Section Header</h3>
            <div style={css.formGrid}>
              <div style={css.formGroup}>
                <label style={css.label}>Slug (URL identifier) *</label>
                <input style={css.input} value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. argus" required />
                <span style={css.hint}>Lowercase, no spaces. Used as the section ID in the page (e.g. #argus).</span>
              </div>
              <div style={css.formGroup}>
                <label style={css.label}>Eyebrow Text</label>
                <input style={css.input} value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="e.g. Our Product" />
              </div>
              <div style={css.formGroup}>
                <label style={css.label}>Section Title *</label>
                <input style={css.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Meet ARGUS" required />
              </div>
              <div style={css.formGroup}>
                <label style={css.label}>Accent Word (highlighted in orange)</label>
                <input style={css.input} value={form.titleAccent} onChange={(e) => setForm({ ...form, titleAccent: e.target.value })} placeholder="e.g. ARGUS" />
                <span style={css.hint}>Must be an exact substring of the Title above.</span>
              </div>
              <div style={{ ...css.formGroup, gridColumn: '1 / -1' }}>
                <label style={css.label}>Subtitle Paragraph</label>
                <textarea style={{ ...css.input, ...css.textarea }} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Short description shown under the title." />
              </div>
            </div>

            <h3 style={{ ...css.subHeading, marginTop: 28 }}>Hero Card</h3>
            <div style={css.formGrid}>
              <div style={css.formGroup}>
                <label style={css.label}>Hero Label</label>
                <input style={css.input} value={form.heroLabel} onChange={(e) => setForm({ ...form, heroLabel: e.target.value })} placeholder="e.g. Flagship Product" />
              </div>
              <div style={css.formGroup}>
                <label style={css.label}>Hero Title</label>
                <input style={css.input} value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} placeholder="e.g. See everything. Miss nothing." />
                <span style={css.hint}>Use \n for a line break in the display.</span>
              </div>
              <div style={{ ...css.formGroup, gridColumn: '1 / -1' }}>
                <label style={css.label}>Hero Body Paragraphs</label>
                <textarea style={{ ...css.input, ...css.textareaXl }} value={form.heroBody} onChange={(e) => setForm({ ...form, heroBody: e.target.value })} placeholder={"First paragraph text.\n\nSecond paragraph text (separated by blank line)."} />
                <span style={css.hint}>Separate paragraphs with a blank line (two newlines).</span>
              </div>
              <div style={css.formGroup}>
                <label style={css.label}>CTA Button Text</label>
                <input style={css.input} value={form.heroCTAText} onChange={(e) => setForm({ ...form, heroCTAText: e.target.value })} placeholder="e.g. Request Early Access" />
              </div>
              <div style={css.formGroup}>
                <label style={css.label}>CTA Button Link</label>
                <input style={css.input} value={form.heroCTAHref} onChange={(e) => setForm({ ...form, heroCTAHref: e.target.value })} placeholder="e.g. #contact or https://..." />
              </div>
            </div>

            <h3 style={{ ...css.subHeading, marginTop: 28 }}>Settings</h3>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={css.formGroup}>
                <label style={css.label}>Display Order</label>
                <input type="number" style={{ ...css.input, width: 120 }} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="1" />
              </div>
              <label style={{ ...css.checkboxLabel, marginTop: 20 }}>
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} style={{ marginRight: 8 }} />
                Visible on website
              </label>
            </div>

            {view === 'add' && (
              <div style={{ marginTop: 24 }}>
                <button onClick={saveAll} disabled={saving} style={css.btnPrimary}>{saving ? 'Saving…' : 'Create Product Section'}</button>
              </div>
            )}
          </div>
        )}

        {/* ── Feature Cards ── */}
        {view === 'edit-features' && (
          <div style={css.formCard}>
            <p style={css.sectionNote}>
              These are the grid of feature cards shown below the hero card.
              You can add, remove, and reorder them. Each card needs an icon (emoji), a title, and a description.
            </p>
            {features.map((f, i) => (
              <div key={i} style={css.repeaterRow}>
                <div style={css.repeaterNum}>{i + 1}</div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12 }}>
                  <div style={css.formGroup}>
                    <label style={css.label}>Icon</label>
                    <input style={{ ...css.input, textAlign: 'center', fontSize: 20 }} value={f.icon} onChange={(e) => updateFeature(i, 'icon', e.target.value)} placeholder="📡" maxLength={4} />
                    <span style={css.hint}>Emoji</span>
                  </div>
                  <div style={css.formGroup}>
                    <label style={css.label}>Title</label>
                    <input style={css.input} value={f.title} onChange={(e) => updateFeature(i, 'title', e.target.value)} placeholder="Feature name" />
                  </div>
                  <div style={{ ...css.formGroup, gridColumn: '1 / -1' }}>
                    <label style={css.label}>Description</label>
                    <textarea style={{ ...css.input, ...css.textarea }} value={f.desc} onChange={(e) => updateFeature(i, 'desc', e.target.value)} placeholder="Describe this feature in 2–3 sentences." />
                  </div>
                </div>
                <button onClick={() => removeFeature(i)} style={css.removeBtn} title="Remove this feature">✕</button>
              </div>
            ))}
            <button onClick={addFeature} style={css.addRowBtn}>+ Add Feature Card</button>
          </div>
        )}

        {/* ── Stats Strip ── */}
        {view === 'edit-stats' && (
          <div style={css.formCard}>
            <p style={css.sectionNote}>
              These are the numbers shown in the stats bar at the bottom of the product section (e.g. "99.9% — Platform Uptime").
            </p>
            {stats.map((s, i) => (
              <div key={i} style={css.repeaterRow}>
                <div style={css.repeaterNum}>{i + 1}</div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={css.formGroup}>
                    <label style={css.label}>Value</label>
                    <input style={css.input} value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="e.g. 99.9% or <1s or 24/7" />
                  </div>
                  <div style={css.formGroup}>
                    <label style={css.label}>Label</label>
                    <input style={css.input} value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="e.g. Platform Uptime" />
                  </div>
                </div>
                <button onClick={() => removeStat(i)} style={css.removeBtn} title="Remove this stat">✕</button>
              </div>
            ))}
            <button onClick={addStat} style={css.addRowBtn}>+ Add Stat</button>
          </div>
        )}
      </div>
    );
  }

  // ── List view ──
  return (
    <div>
      <div style={css.pageHeader}>
        <div>
          <h1 style={css.pageTitle}>Products</h1>
          <p style={css.pageSubtitle}>
            Manage product sections like Argus. Each product gets its own section on the homepage with a hero card, feature grid, and stats strip.
          </p>
        </div>
        <button onClick={openAdd} style={css.btnPrimary}>+ Add Product Section</button>
      </div>

      {msg && <div style={msg.type === 'ok' ? css.alertOk : css.alertErr}>{msg.text}</div>}

      {loading ? <p style={css.emptyMsg}>Loading…</p> : products.length === 0 ? (
        <div style={css.emptyCard}>
          <p style={css.emptyMsg}>No product sections in the database yet.</p>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '8px 0 0' }}>
            Run the seed script first to import your existing Argus section, then edit it here.
          </p>
        </div>
      ) : (
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead><tr>
              <th style={css.th}>Product</th>
              <th style={css.th}>Slug</th>
              <th style={css.th}>Features</th>
              <th style={css.th}>Stats</th>
              <th style={css.th}>Order</th>
              <th style={css.th}>Visible</th>
              <th style={css.th}>Actions</th>
            </tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={css.tr}>
                  <td style={css.td}>
                    <strong>{p.title}</strong><br />
                    <span style={css.subText}>{p.subtitle?.slice(0, 60)}{p.subtitle?.length > 60 ? '…' : ''}</span>
                  </td>
                  <td style={css.td}><code style={css.code}>#{p.slug}</code></td>
                  <td style={css.td}>{p.features.length} cards</td>
                  <td style={css.td}>{p.stats.length} stats</td>
                  <td style={css.td}>{p.order}</td>
                  <td style={css.td}>
                    <button onClick={() => handleToggle(p)} style={p.enabled ? css.toggleOn : css.toggleOff}>
                      {p.enabled ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td style={css.td}>
                    <div style={css.actionGroup}>
                      <button onClick={() => openEdit(p)} style={css.btnEdit}>Edit</button>
                      <button onClick={() => handleDelete(p._id, p.title)} style={css.btnDelete}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Enquiries Viewer ─────────────────────────────────────────────────────────

function EnquiriesViewer() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/enquiries')
      .then((r) => r.json())
      .then((data) => { if (data.ok) setEnquiries(data.enquiries); else setError(data.message ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  function fmtDate(iso: string) {
    try { return new Date(iso).toLocaleString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  }

  return (
    <div>
      <div style={css.pageHeader}>
        <div>
          <h1 style={css.pageTitle}>Enquiries</h1>
          <p style={css.pageSubtitle}>All contact form submissions. Read-only.</p>
        </div>
        <span style={css.countBadge}>{enquiries.length} total</span>
      </div>
      {error && <div style={css.alertErr}>{error}</div>}
      {loading ? <p style={css.emptyMsg}>Loading…</p> : enquiries.length === 0 ? (
        <div style={css.emptyCard}><p style={css.emptyMsg}>No enquiries yet.</p></div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={css.tableWrap}>
              <table style={css.table}>
                <thead><tr>
                  <th style={css.th}>Name</th>
                  <th style={css.th}>Email</th>
                  <th style={css.th}>Service</th>
                  <th style={css.th}>Date</th>
                  <th style={css.th}></th>
                </tr></thead>
                <tbody>
                  {enquiries.map((e) => (
                    <tr key={e._id} style={{ ...css.tr, background: selected?._id === e._id ? '#f0f4ff' : undefined, cursor: 'pointer' }} onClick={() => setSelected(e)}>
                      <td style={css.td}><strong>{e.name}</strong></td>
                      <td style={css.td}>{e.email}</td>
                      <td style={css.td}><span style={css.badge}>{e.service || '—'}</span></td>
                      <td style={css.td}>{fmtDate(e.createdAt)}</td>
                      <td style={css.td}><button style={css.btnEdit} onClick={() => setSelected(e)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {selected && (
            <div style={css.detailPanel}>
              <div style={css.detailHeader}>
                <strong>Message Detail</strong>
                <button onClick={() => setSelected(null)} style={css.closeBtn}>✕</button>
              </div>
              <dl style={css.dl}>
                <dt style={css.dt}>Name</dt><dd style={css.dd}>{selected.name}</dd>
                <dt style={css.dt}>Email</dt><dd style={css.dd}><a href={`mailto:${selected.email}`} style={{ color: '#2563eb' }}>{selected.email}</a></dd>
                <dt style={css.dt}>Phone</dt><dd style={css.dd}>{selected.phone || '—'}</dd>
                <dt style={css.dt}>Service Interest</dt><dd style={css.dd}>{selected.service || '—'}</dd>
                <dt style={css.dt}>Received</dt><dd style={css.dd}>{fmtDate(selected.createdAt)}</dd>
                <dt style={css.dt}>Message</dt><dd style={{ ...css.dd, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selected.message}</dd>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const css: Record<string, React.CSSProperties> = {
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  loginBox: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px 36px', width: '100%', maxWidth: 400 },
  loginLogo: { textAlign: 'center', marginBottom: 28 },
  loginLogoText: { display: 'block', fontSize: 22, fontWeight: 700, color: '#111' },
  loginLogoSub: { display: 'block', fontSize: 12, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' },
  loginHint: { marginTop: 16, textAlign: 'center', fontSize: 12, color: '#aaa' },
  dashWrap: { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc', color: '#111' },
  sidebar: { width: 220, background: '#111', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
  sidebarBrand: { padding: '0 20px 24px', borderBottom: '1px solid #222' },
  brandName: { display: 'block', fontSize: 18, fontWeight: 700, color: '#fff' },
  brandBadge: { display: 'block', fontSize: 11, color: '#666', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '16px 12px' },
  navBtn: { background: 'transparent', border: 'none', color: '#aaa', textAlign: 'left', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
  navBtnActive: { background: '#222', color: '#fff' },
  logoutBtn: { margin: '0 12px', padding: '10px 12px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  main: { flex: 1, padding: '32px 36px', maxWidth: 1100, overflowX: 'auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: 700, margin: '0 0 4px' },
  pageSubtitle: { fontSize: 14, color: '#666', margin: 0, maxWidth: 560 },
  formCard: { background: '#fff', borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' },
  formTitle: { fontSize: 16, fontWeight: 600, margin: '0 0 20px' },
  subHeading: { fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 16px', paddingBottom: 8, borderBottom: '1px solid #f3f4f6' },
  sectionNote: { fontSize: 13, color: '#6b7280', margin: '0 0 20px', padding: '10px 14px', background: '#f9fafb', borderRadius: 6 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  checkboxLabel: { fontSize: 14, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  formActions: { display: 'flex', gap: 12, paddingTop: 8 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111', background: '#fff', width: '100%', boxSizing: 'border-box' as const },
  textarea: { minHeight: 80, resize: 'vertical' as const },
  textareaLg: { minHeight: 110, resize: 'vertical' as const },
  textareaXl: { minHeight: 140, resize: 'vertical' as const },
  btnPrimary: { background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' as const },
  btnSecondary: { background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  btnEdit: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnDelete: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  actionGroup: { display: 'flex', gap: 8 },
  tableWrap: { borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '12px 16px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '14px 16px', fontSize: 14, verticalAlign: 'middle' as const },
  subText: { fontSize: 12, color: '#9ca3af' },
  badge: { background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 4, fontSize: 12 },
  code: { background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' },
  toggleOn: { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer' },
  toggleOff: { background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb', padding: '3px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer' },
  alertOk: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 },
  alertErr: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 },
  errorText: { color: '#dc2626', fontSize: 13, margin: 0 },
  emptyCard: { background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 40, textAlign: 'center' as const },
  emptyMsg: { color: '#9ca3af', fontSize: 14 },
  countBadge: { background: '#f3f4f6', color: '#374151', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 600 },
  detailPanel: { width: 320, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, flexShrink: 0, position: 'sticky' as const, top: 20 },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 14 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' },
  dl: { margin: 0 },
  dt: { fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: 12, marginBottom: 2 },
  dd: { margin: 0, fontSize: 14, color: '#111' },
  stepTabs: { display: 'flex', gap: 4, marginBottom: 20 },
  stepTab: { padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280' },
  stepTabActive: { background: '#111', color: '#fff', border: '1px solid #111' },
  repeaterRow: { display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f3f4f6' },
  repeaterNum: { width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#374151', flexShrink: 0, marginTop: 2 },
  removeBtn: { background: 'none', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, flexShrink: 0, marginTop: 2 },
  addRowBtn: { margin: '16px 0 0', background: '#f9fafb', border: '1px dashed #d1d5db', color: '#374151', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, width: '100%' },
};
