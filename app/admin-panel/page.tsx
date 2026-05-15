'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

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

type EnquiryStatus = 'unread' | 'read' | 'replied' | 'review' | 'archived';

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
  notes?: string;
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

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<EnquiryStatus, { label: string; color: string; bg: string; border: string }> = {
  unread:   { label: 'Unread',        color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  read:     { label: 'Read',          color: '#374151', bg: '#f3f4f6', border: '#d1d5db' },
  replied:  { label: 'Replied',       color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  review:   { label: 'Needs Review',  color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  archived: { label: 'Archived',      color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb' },
};

const SERVICE_OPTIONS = [
  'dba-support', 'ai-solutions', 'devops-secops',
  'network-security', 'service-desk', 'observability', 'other', '',
];

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
      slug: p.slug, eyebrow: p.eyebrow, title: p.title, titleAccent: p.titleAccent,
      subtitle: p.subtitle, heroLabel: p.heroCard.label, heroTitle: p.heroCard.title,
      heroBody: p.heroCard.body.join('\n\n'), heroCTAText: p.heroCard.ctaText,
      heroCTAHref: p.heroCard.ctaHref, order: String(p.order), enabled: p.enabled,
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
      slug: form.slug, eyebrow: form.eyebrow, title: form.title, titleAccent: form.titleAccent,
      subtitle: form.subtitle,
      heroCard: {
        label: form.heroLabel, title: form.heroTitle,
        body: form.heroBody.split('\n\n').map(s => s.trim()).filter(Boolean),
        ctaText: form.heroCTAText, ctaHref: form.heroCTAHref,
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

  function updateFeature(i: number, field: keyof ProductFeature, val: string) {
    const next = [...features]; next[i] = { ...next[i], [field]: val }; setFeatures(next);
  }
  function addFeature() { setFeatures([...features, { icon: '⭐', title: '', desc: '' }]); }
  function removeFeature(i: number) { setFeatures(features.filter((_, idx) => idx !== i)); }

  function updateStat(i: number, field: keyof ProductStat, val: string) {
    const next = [...stats]; next[i] = { ...next[i], [field]: val }; setStats(next);
  }
  function addStat() { setStats([...stats, { value: '', label: '' }]); }
  function removeStat(i: number) { setStats(stats.filter((_, idx) => idx !== i)); }

  const isEditing = view === 'edit-basic' || view === 'edit-features' || view === 'edit-stats' || view === 'add';

  if (isEditing) {
    return (
      <div>
        <div style={css.pageHeader}>
          <div>
            <h1 style={css.pageTitle}>{editTarget ? `Editing: ${editTarget.title}` : 'New Product Section'}</h1>
            <p style={css.pageSubtitle}>Fill in all three tabs, then click Save.</p>
          </div>
          <div style={css.actionGroup}>
            <button onClick={saveAll} disabled={saving} style={css.btnPrimary}>{saving ? 'Saving…' : 'Save Product Section'}</button>
            <button onClick={cancelAll} style={css.btnSecondary}>Cancel</button>
          </div>
        </div>

        {msg && <div style={msg.type === 'ok' ? css.alertOk : css.alertErr}>{msg.text}</div>}

        {view !== 'add' && (
          <div style={css.stepTabs}>
            <button style={{ ...css.stepTab, ...(view === 'edit-basic' ? css.stepTabActive : {}) }} onClick={() => setView('edit-basic')}>1. Basic Info & Hero</button>
            <button style={{ ...css.stepTab, ...(view === 'edit-features' ? css.stepTabActive : {}) }} onClick={() => setView('edit-features')}>2. Feature Cards</button>
            <button style={{ ...css.stepTab, ...(view === 'edit-stats' ? css.stepTabActive : {}) }} onClick={() => setView('edit-stats')}>3. Stats Strip</button>
          </div>
        )}

        {(view === 'edit-basic' || view === 'add') && (
          <div style={css.formCard}>
            {view === 'add' && <p style={css.sectionNote}>Fill in the details below. After saving, you can edit features and stats from the product list.</p>}
            <h3 style={css.subHeading}>Section Header</h3>
            <div style={css.formGrid}>
              <div style={css.formGroup}>
                <label style={css.label}>Slug (URL identifier) *</label>
                <input style={css.input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. argus" required />
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

        {view === 'edit-features' && (
          <div style={css.formCard}>
            <p style={css.sectionNote}>These are the grid of feature cards shown below the hero card.</p>
            {features.map((f, i) => (
              <div key={i} style={css.repeaterRow}>
                <div style={css.repeaterNum}>{i + 1}</div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12 }}>
                  <div style={css.formGroup}>
                    <label style={css.label}>Icon</label>
                    <input style={{ ...css.input, textAlign: 'center', fontSize: 20 }} value={f.icon} onChange={(e) => updateFeature(i, 'icon', e.target.value)} placeholder="📡" maxLength={4} />
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
                <button onClick={() => removeFeature(i)} style={css.removeBtn} title="Remove">✕</button>
              </div>
            ))}
            <button onClick={addFeature} style={css.addRowBtn}>+ Add Feature Card</button>
          </div>
        )}

        {view === 'edit-stats' && (
          <div style={css.formCard}>
            <p style={css.sectionNote}>Numbers shown in the stats bar at the bottom of the product section.</p>
            {stats.map((s, i) => (
              <div key={i} style={css.repeaterRow}>
                <div style={css.repeaterNum}>{i + 1}</div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={css.formGroup}>
                    <label style={css.label}>Value</label>
                    <input style={css.input} value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="e.g. 99.9% or <1s" />
                  </div>
                  <div style={css.formGroup}>
                    <label style={css.label}>Label</label>
                    <input style={css.input} value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="e.g. Platform Uptime" />
                  </div>
                </div>
                <button onClick={() => removeStat(i)} style={css.removeBtn} title="Remove">✕</button>
              </div>
            ))}
            <button onClick={addStat} style={css.addRowBtn}>+ Add Stat</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={css.pageHeader}>
        <div>
          <h1 style={css.pageTitle}>Products</h1>
          <p style={css.pageSubtitle}>Manage product sections like Argus.</p>
        </div>
        <button onClick={openAdd} style={css.btnPrimary}>+ Add Product Section</button>
      </div>
      {msg && <div style={msg.type === 'ok' ? css.alertOk : css.alertErr}>{msg.text}</div>}
      {loading ? <p style={css.emptyMsg}>Loading…</p> : products.length === 0 ? (
        <div style={css.emptyCard}><p style={css.emptyMsg}>No product sections yet.</p></div>
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
                  <td style={css.td}><strong>{p.title}</strong><br /><span style={css.subText}>{p.subtitle?.slice(0, 60)}{p.subtitle?.length > 60 ? '…' : ''}</span></td>
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

  // ── Search + filter state ──
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<EnquiryStatus | 'all'>('all');
  const [filterService, setFilterService] = useState<string>('all');

  // ── Detail panel state ──
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/enquiries')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setEnquiries(data.enquiries);
        else setError(data.message ?? 'Failed to load.');
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived filtered list ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enquiries.filter((e) => {
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (filterService !== 'all' && e.service !== filterService) return false;
      if (q) {
        const haystack = `${e.name} ${e.email} ${e.phone} ${e.service} ${e.message}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [enquiries, search, filterStatus, filterService]);

  // ── Status counts for the filter tabs ──
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: enquiries.length };
    for (const e of enquiries) {
      c[e.status] = (c[e.status] ?? 0) + 1;
    }
    return c;
  }, [enquiries]);

  // ── Unique services in the dataset for the service filter dropdown ──
  const serviceOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const e of enquiries) if (e.service) seen.add(e.service);
    return Array.from(seen).sort();
  }, [enquiries]);

  function fmtDate(iso: string) {
    try { return new Date(iso).toLocaleString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  }

  // When selecting a row, if it's unread mark it read automatically
  async function selectEnquiry(e: Enquiry) {
    setSelected(e);
    setNoteDraft(e.notes ?? '');
    setEditingNotes(false);
    if (e.status === 'unread') {
      await patchStatus(e._id, 'read', e.notes);
    }
  }

  async function patchStatus(id: string, status: EnquiryStatus, notes?: string) {
    setStatusSaving(true);
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes }),
      });
      if (res.ok) {
        // Update local state without a full reload
        setEnquiries((prev) =>
          prev.map((eq) => eq._id === id ? { ...eq, status, notes: notes ?? eq.notes } : eq)
        );
        setSelected((prev) => prev?._id === id ? { ...prev, status, notes: notes ?? prev.notes } : prev);
      }
    } finally {
      setStatusSaving(false);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    await patchStatus(selected._id, selected.status, noteDraft);
    setEditingNotes(false);
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div style={css.pageHeader}>
        <div>
          <h1 style={css.pageTitle}>Enquiries</h1>
          <p style={css.pageSubtitle}>All contact form submissions — search, filter, and manage status.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={css.countBadge}>{enquiries.length} total</span>
          <button onClick={load} style={css.btnSecondary} title="Refresh">↻ Refresh</button>
        </div>
      </div>

      {error && <div style={css.alertErr}>{error}</div>}

      {/* ── Status filter tabs ── */}
      <div style={enqCss.filterTabs}>
        {(['all', 'unread', 'read', 'replied', 'review', 'archived'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              ...enqCss.filterTab,
              ...(filterStatus === s ? enqCss.filterTabActive : {}),
            }}
          >
            {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            <span style={{
              ...enqCss.filterTabCount,
              background: filterStatus === s ? '#111' : '#f3f4f6',
              color: filterStatus === s ? '#fff' : '#6b7280',
            }}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search + service filter bar ── */}
      <div style={enqCss.searchBar}>
        <div style={enqCss.searchWrap}>
          <span style={enqCss.searchIcon}>🔍</span>
          <input
            style={enqCss.searchInput}
            placeholder="Search by name, email, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={enqCss.clearBtn}>✕</button>
          )}
        </div>
        <select
          style={enqCss.serviceSelect}
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
        >
          <option value="all">All services</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>{s || '(no service)'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={css.emptyMsg}>Loading…</p>
      ) : enquiries.length === 0 ? (
        <div style={css.emptyCard}><p style={css.emptyMsg}>No enquiries yet.</p></div>
      ) : (
        <div style={enqCss.layout}>
          {/* ── Table ── */}
          <div style={enqCss.tableCol}>
            {filtered.length === 0 ? (
              <div style={{ ...css.emptyCard, marginTop: 0 }}>
                <p style={css.emptyMsg}>No enquiries match your filters.</p>
              </div>
            ) : (
              <div style={css.tableWrap}>
                <table style={css.table}>
                  <thead><tr>
                    <th style={css.th}>Status</th>
                    <th style={css.th}>Name</th>
                    <th style={css.th}>Email</th>
                    <th style={css.th}>Service</th>
                    <th style={css.th}>Date</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((e) => {
                      const sc = STATUS_CONFIG[e.status ?? 'unread'];
                      const isSelected = selected?._id === e._id;
                      return (
                        <tr
                          key={e._id}
                          style={{
                            ...css.tr,
                            background: isSelected ? '#f0f4ff' : undefined,
                            cursor: 'pointer',
                            fontWeight: e.status === 'unread' ? 600 : 400,
                          }}
                          onClick={() => selectEnquiry(e)}
                        >
                          <td style={css.td}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 600,
                              background: sc.bg,
                              color: sc.color,
                              border: `1px solid ${sc.border}`,
                              whiteSpace: 'nowrap' as const,
                            }}>
                              {sc.label}
                            </span>
                          </td>
                          <td style={css.td}>
                            {e.status === 'unread' && (
                              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#2563eb', marginRight: 6, verticalAlign: 'middle' }} />
                            )}
                            {e.name}
                          </td>
                          <td style={css.td}><span style={css.subText}>{e.email}</span></td>
                          <td style={css.td}><span style={css.badge}>{e.service || '—'}</span></td>
                          <td style={css.td}><span style={css.subText}>{fmtDate(e.createdAt)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Detail panel ── */}
          {selected && (
            <div style={enqCss.detailPanel}>
              <div style={enqCss.detailHeader}>
                <strong style={{ fontSize: 14 }}>Enquiry Detail</strong>
                <button onClick={() => setSelected(null)} style={css.closeBtn}>✕</button>
              </div>

              {/* Status changer */}
              <div style={enqCss.statusSection}>
                <p style={enqCss.statusLabel}>STATUS</p>
                <div style={enqCss.statusButtons}>
                  {(['unread', 'read', 'replied', 'review', 'archived'] as EnquiryStatus[]).map((s) => {
                    const sc = STATUS_CONFIG[s];
                    const isActive = selected.status === s;
                    return (
                      <button
                        key={s}
                        disabled={statusSaving}
                        onClick={() => patchStatus(selected._id, s, selected.notes)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: isActive ? 700 : 500,
                          border: `1px solid ${isActive ? sc.color : sc.border}`,
                          background: isActive ? sc.bg : '#fff',
                          color: isActive ? sc.color : '#9ca3af',
                          cursor: statusSaving ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fields */}
              <dl style={css.dl}>
                <dt style={css.dt}>Name</dt>
                <dd style={css.dd}>{selected.name}</dd>

                <dt style={css.dt}>Email</dt>
                <dd style={css.dd}>
                  <a href={`mailto:${selected.email}`} style={{ color: '#2563eb' }}>{selected.email}</a>
                </dd>

                <dt style={css.dt}>Phone</dt>
                <dd style={css.dd}>{selected.phone || '—'}</dd>

                <dt style={css.dt}>Service Interest</dt>
                <dd style={css.dd}>{selected.service || '—'}</dd>

                <dt style={css.dt}>Received</dt>
                <dd style={css.dd}>{fmtDate(selected.createdAt)}</dd>

                <dt style={css.dt}>Message</dt>
                <dd style={{ ...css.dd, whiteSpace: 'pre-wrap', lineHeight: 1.6, marginTop: 4, padding: '10px 12px', background: '#f9fafb', borderRadius: 6, border: '1px solid #f3f4f6' }}>
                  {selected.message}
                </dd>
              </dl>

              {/* Internal notes */}
              <div style={enqCss.notesSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <p style={enqCss.statusLabel}>INTERNAL NOTES</p>
                  {!editingNotes && (
                    <button onClick={() => { setNoteDraft(selected.notes ?? ''); setEditingNotes(true); }} style={enqCss.editNoteBtn}>
                      {selected.notes ? 'Edit' : '+ Add note'}
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                      style={{ ...css.input, minHeight: 80, resize: 'vertical', fontSize: 13 }}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add internal notes about this enquiry…"
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={saveNotes} disabled={statusSaving} style={{ ...css.btnPrimary, fontSize: 12, padding: '6px 14px' }}>
                        {statusSaving ? 'Saving…' : 'Save Note'}
                      </button>
                      <button onClick={() => setEditingNotes(false)} style={{ ...css.btnSecondary, fontSize: 12, padding: '6px 14px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  selected.notes
                    ? <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{selected.notes}</p>
                    : <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>No notes yet.</p>
                )}
              </div>

              {/* Quick reply shortcut */}
              <div style={{ marginTop: 16 }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: Your Enquiry — Edgeshift Inc`}
                  onClick={() => patchStatus(selected._id, 'replied', selected.notes)}
                  style={{ ...css.btnPrimary, display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: 13 } as React.CSSProperties}
                >
                  ✉ Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Enquiries-specific styles ────────────────────────────────────────────────

const enqCss: Record<string, React.CSSProperties> = {
  filterTabs: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  filterTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 8,
    border: '1px solid #e5e7eb', background: '#fff',
    cursor: 'pointer', fontSize: 13, color: '#6b7280',
    fontWeight: 500, transition: 'all 0.15s',
  },
  filterTabActive: { background: '#111', color: '#fff', borderColor: '#111' },
  filterTabCount: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 20, height: 18, borderRadius: 9,
    fontSize: 11, fontWeight: 700, padding: '0 5px',
  },
  searchBar: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  searchWrap: {
    flex: 1, minWidth: 200,
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1px solid #d1d5db', borderRadius: 8,
    padding: '0 12px', background: '#fff',
  },
  searchIcon: { fontSize: 14, color: '#9ca3af', flexShrink: 0 },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: 14, padding: '9px 0', background: 'transparent', color: '#111',
  },
  clearBtn: {
    background: 'none', border: 'none', color: '#9ca3af',
    cursor: 'pointer', fontSize: 13, padding: '2px 4px',
    flexShrink: 0,
  },
  serviceSelect: {
    padding: '9px 12px', borderRadius: 8,
    border: '1px solid #d1d5db', fontSize: 14,
    color: '#374151', background: '#fff', cursor: 'pointer',
    minWidth: 160,
  },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  tableCol: { flex: 1, minWidth: 0 },
  detailPanel: {
    width: 340, flexShrink: 0,
    background: '#fff', borderRadius: 12,
    border: '1px solid #e5e7eb', padding: 20,
    position: 'sticky', top: 20,
    maxHeight: 'calc(100vh - 60px)', overflowY: 'auto',
  },
  detailHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
    paddingBottom: 12, borderBottom: '1px solid #f3f4f6',
  },
  statusSection: { marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' },
  statusLabel: { fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' },
  statusButtons: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  notesSection: { marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' },
  editNoteBtn: {
    background: 'none', border: 'none',
    color: '#2563eb', fontSize: 12,
    cursor: 'pointer', padding: 0, fontWeight: 600,
  },
};

// ─── Shared styles ────────────────────────────────────────────────────────────

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
  main: { flex: 1, padding: '32px 36px', overflowX: 'auto' },
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
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' },
  dl: { margin: 0 },
  dt: { fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 12, marginBottom: 3 },
  dd: { margin: 0, fontSize: 14, color: '#111' },
  stepTabs: { display: 'flex', gap: 4, marginBottom: 20 },
  stepTab: { padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6b7280' },
  stepTabActive: { background: '#111', color: '#fff', border: '1px solid #111' },
  repeaterRow: { display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f3f4f6' },
  repeaterNum: { width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#374151', flexShrink: 0, marginTop: 2 },
  removeBtn: { background: 'none', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, flexShrink: 0, marginTop: 2 },
  addRowBtn: { margin: '16px 0 0', background: '#f9fafb', border: '1px dashed #d1d5db', color: '#374151', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, width: '100%' },
};
