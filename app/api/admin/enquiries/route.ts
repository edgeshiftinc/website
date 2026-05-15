import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import {
  getContactQueries,
  updateContactQueryStatus,
  deleteContactQuery,
  EnquiryStatus,
} from '@/lib/models';

// ── GET /api/admin/enquiries ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const enquiries = await getContactQueries(200);
    const serialized = enquiries.map((e) => ({
      ...e,
      _id: e._id?.toString(),
      createdAt: e.createdAt?.toISOString(),
      // Backfill old docs that predate the status field
      status: (e.status ?? 'unread') as EnquiryStatus,
      notes: e.notes ?? '',
    }));
    return NextResponse.json({ ok: true, count: serialized.length, enquiries: serialized });
  } catch (err) {
    console.error('[api/admin/enquiries] GET error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to fetch enquiries.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/enquiries — update status and/or notes ──────────────────
export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = await req.json() as { id?: string; status?: EnquiryStatus; notes?: string };
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ ok: false, message: 'Missing enquiry id.' }, { status: 400 });
    }

    const validStatuses: EnquiryStatus[] = ['unread', 'read', 'replied', 'review', 'archived'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, message: 'Invalid status value.' }, { status: 400 });
    }

    // If only notes are being updated (no status change), preserve existing status
    // by passing undefined — updateContactQueryStatus handles this correctly
    const updated = await updateContactQueryStatus(id, status ?? 'read', notes);
    if (!updated) {
      return NextResponse.json({ ok: false, message: 'Enquiry not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/enquiries] PATCH error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to update enquiry.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/enquiries — permanently delete an enquiry ───────────────
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = await req.json() as { id?: string };
    if (!body.id) {
      return NextResponse.json({ ok: false, message: 'Missing enquiry id.' }, { status: 400 });
    }
    const deleted = await deleteContactQuery(body.id);
    if (!deleted) {
      return NextResponse.json({ ok: false, message: 'Enquiry not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/enquiries] DELETE error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to delete enquiry.' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ ok: false, message: 'Method not allowed.' }, { status: 405 });
}
