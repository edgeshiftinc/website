import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/models';

export const dynamic = 'force-dynamic';

function serialize(t: Record<string, unknown>) {
  const raw = t._id;
  let idStr: string;
  if (raw == null) {
    idStr = '';
  } else if (typeof raw === 'string') {
    idStr = raw;
  } else if (typeof raw === 'object' && 'toHexString' in raw) {
    idStr = (raw as { toHexString(): string }).toHexString();
  } else {
    idStr = String(raw);
  }
  return {
    ...t,
    _id: idStr,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : (t.createdAt ?? null),
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : (t.updatedAt ?? null),
  };
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const testimonials = await getAllTestimonials();
    const serialized = testimonials.map((t) => serialize(t as unknown as Record<string, unknown>));
    return NextResponse.json({ ok: true, testimonials: serialized });
  } catch (err) {
    console.error('[api/admin/testimonials] GET error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to fetch.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { company, industry, quote, rating, order, enabled } = body;
    if (!company?.trim() || !quote?.trim()) {
      return NextResponse.json({ ok: false, message: 'Company and quote are required.' }, { status: 400 });
    }
    const id = await createTestimonial({
      company:  company.trim(),
      industry: (industry ?? '').trim(),
      quote:    quote.trim(),
      rating:   Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
      order:    parseInt(order, 10) || 99,
      enabled:  enabled !== false,
    });
    return NextResponse.json({ ok: true, id: id.toString() });
  } catch (err) {
    console.error('[api/admin/testimonials] POST error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to create.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ ok: false, message: 'Missing id.' }, { status: 400 });
    if (fields.rating   !== undefined) fields.rating   = Math.min(5, Math.max(1, parseInt(fields.rating, 10) || 5));
    if (fields.order    !== undefined) fields.order    = parseInt(fields.order, 10) || 99;
    if (fields.company  !== undefined) fields.company  = fields.company.trim();
    if (fields.industry !== undefined) fields.industry = fields.industry.trim();
    if (fields.quote    !== undefined) fields.quote    = fields.quote.trim();
    const updated = await updateTestimonial(id, fields);
    if (!updated) return NextResponse.json({ ok: false, message: 'Testimonial not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/testimonials] PUT error:', err);
    return NextResponse.json({ ok: false, message: `Failed to update: ${String(err)}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, message: 'Missing id.' }, { status: 400 });
    const deleted = await deleteTestimonial(id);
    if (!deleted) return NextResponse.json({ ok: false, message: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/testimonials] DELETE error:', err);
    return NextResponse.json({ ok: false, message: `Failed to delete: ${String(err)}` }, { status: 500 });
  }
}
