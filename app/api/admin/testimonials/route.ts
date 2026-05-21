import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/models';

function serialize(t: Record<string, unknown>) {
  return {
    ...t,
    _id: t._id?.toString(),
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
  };
}

// Safely build a filter that works whether _id is an ObjectId or a plain string
function buildIdFilter(id: string) {
  try {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id as unknown as ObjectId }] };
  } catch {
    return { _id: id as unknown as ObjectId };
  }
}

// GET — fetch all testimonials (admin sees all including disabled)
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const testimonials = await getAllTestimonials();
    return NextResponse.json({ ok: true, testimonials: testimonials.map(serialize) });
  } catch (err) {
    console.error('[api/admin/testimonials] GET error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to fetch.' }, { status: 500 });
  }
}

// POST — create new testimonial
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { company, industry, quote, rating, order, enabled } = body;
    if (!company || !quote) {
      return NextResponse.json({ ok: false, message: 'Company and quote are required.' }, { status: 400 });
    }
    const id = await createTestimonial({
      company: company.trim(),
      industry: (industry ?? '').trim(),
      quote: quote.trim(),
      rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
      order: parseInt(order, 10) || 99,
      enabled: enabled !== false,
    });
    return NextResponse.json({ ok: true, id: id.toString() });
  } catch (err) {
    console.error('[api/admin/testimonials] POST error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to create.' }, { status: 500 });
  }
}

// PUT — update existing testimonial
export async function PUT(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ ok: false, message: 'Missing id.' }, { status: 400 });
    if (fields.rating !== undefined) fields.rating = Math.min(5, Math.max(1, parseInt(fields.rating, 10) || 5));
    if (fields.order !== undefined) fields.order = parseInt(fields.order, 10) || 99;
    const updated = await updateTestimonial(id, fields);
    if (!updated) return NextResponse.json({ ok: false, message: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/testimonials] PUT error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to update.' }, { status: 500 });
  }
}

// DELETE
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
    return NextResponse.json({ ok: false, message: 'Failed to delete.' }, { status: 500 });
  }
}
