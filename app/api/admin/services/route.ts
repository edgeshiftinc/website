import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from '@/lib/models';

// GET /api/admin/services — fetch all services (admin only)
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const services = await getAllServices();
    return NextResponse.json({ ok: true, services });
  } catch (err) {
    console.error('[api/admin/services] GET error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to fetch services.' }, { status: 500 });
  }
}

// POST /api/admin/services — create a service
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 });
  }

  const { title, tag, tagline, description, highlights, order, enabled } = body;

  if (!title || !description) {
    return NextResponse.json(
      { ok: false, message: 'title and description are required.' },
      { status: 422 }
    );
  }

  // highlights can be passed as a string (newline-separated) or array
  let parsedHighlights: string[] = [];
  if (Array.isArray(highlights)) {
    parsedHighlights = highlights.map((h) => String(h).trim()).filter(Boolean);
  } else if (typeof highlights === 'string') {
    parsedHighlights = highlights.split('\n').map((h) => h.trim()).filter(Boolean);
  }

  try {
    const id = await createService({
      title: String(title).trim(),
      tag: String(tag ?? '').trim(),
      tagline: String(tagline ?? '').trim(),
      description: String(description).trim(),
      highlights: parsedHighlights,
      order: typeof order === 'number' ? order : 99,
      enabled: enabled !== false, // default true
    });
    return NextResponse.json({ ok: true, id: id.toString() }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/services] POST error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to create service.' }, { status: 500 });
  }
}

// PUT /api/admin/services — update a service
// Body must include { id: string, ...fields }
export async function PUT(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 });
  }

  const { id, ...rest } = body;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ ok: false, message: 'id is required.' }, { status: 422 });
  }

  // Parse highlights if present
  if (rest.highlights !== undefined) {
    if (Array.isArray(rest.highlights)) {
      rest.highlights = (rest.highlights as string[]).map((h) => h.trim()).filter(Boolean);
    } else if (typeof rest.highlights === 'string') {
      rest.highlights = (rest.highlights as string).split('\n').map((h: string) => h.trim()).filter(Boolean);
    }
  }

  try {
    const ok = await updateService(id, rest);
    if (!ok) {
      return NextResponse.json({ ok: false, message: 'Service not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/services] PUT error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to update service.' }, { status: 500 });
  }
}

// DELETE /api/admin/services — delete a service
// Body: { id: string }
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ ok: false, message: 'id is required.' }, { status: 422 });
  }

  try {
    const ok = await deleteService(body.id);
    if (!ok) {
      return NextResponse.json({ ok: false, message: 'Service not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/services] DELETE error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to delete service.' }, { status: 500 });
  }
}
