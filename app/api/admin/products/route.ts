import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/models';

// ── GET — fetch all products (admin sees all, including disabled) ──────────────
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const products = await getAllProducts();
    const serialized = products.map((p) => ({
      ...p,
      _id: p._id?.toString(),
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));
    return NextResponse.json({ ok: true, products: serialized });
  } catch (err) {
    console.error('[api/admin/products] GET error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to fetch products.' }, { status: 500 });
  }
}

// ── POST — create a new product section ───────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 }); }

  // Validate required fields
  if (!body.slug || !body.title) {
    return NextResponse.json(
      { ok: false, message: 'slug and title are required.' },
      { status: 422 }
    );
  }

  // Parse features — can come as JSON string or array
  const features = parseJSONField(body.features, []);
  const stats = parseJSONField(body.stats, []);
  const heroCard = parseJSONField(body.heroCard, {
    label: '', title: '', body: [], ctaText: '', ctaHref: '#contact',
  });

  try {
    const id = await createProduct({
      slug: String(body.slug).toLowerCase().trim().replace(/\s+/g, '-'),
      eyebrow: String(body.eyebrow ?? 'Our Product').trim(),
      title: String(body.title).trim(),
      titleAccent: String(body.titleAccent ?? '').trim(),
      subtitle: String(body.subtitle ?? '').trim(),
      heroCard,
      features,
      stats,
      order: Number(body.order) || 99,
      enabled: body.enabled !== false,
    });
    return NextResponse.json({ ok: true, id: id.toString() }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/products] POST error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to create product.' }, { status: 500 });
  }
}

// ── PUT — update a product section ────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 }); }

  const { id, ...rest } = body;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ ok: false, message: 'id is required.' }, { status: 422 });
  }

  // Parse nested fields if they were sent as strings
  if (rest.features !== undefined) rest.features = parseJSONField(rest.features, []);
  if (rest.stats !== undefined) rest.stats = parseJSONField(rest.stats, []);
  if (rest.heroCard !== undefined) rest.heroCard = parseJSONField(rest.heroCard, {});

  try {
    const ok = await updateProduct(id, rest);
    if (!ok) return NextResponse.json({ ok: false, message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/products] PUT error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to update product.' }, { status: 500 });
  }
}

// ── DELETE — delete a product section ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body: { id?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 }); }

  if (!body.id) {
    return NextResponse.json({ ok: false, message: 'id is required.' }, { status: 422 });
  }

  try {
    const ok = await deleteProduct(body.id);
    if (!ok) return NextResponse.json({ ok: false, message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/products] DELETE error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to delete product.' }, { status: 500 });
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJSONField(value: unknown, fallback: any): any {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value ?? fallback;
}
