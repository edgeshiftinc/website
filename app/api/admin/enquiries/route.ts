import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { getContactQueries } from '@/lib/models';

// GET /api/admin/enquiries
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const enquiries = await getContactQueries(200);
    // Serialize ObjectId → string so JSON.stringify works
    const serialized = enquiries.map((e) => ({
      ...e,
      _id: e._id?.toString(),
      createdAt: e.createdAt?.toISOString(),
    }));
    return NextResponse.json({ ok: true, count: serialized.length, enquiries: serialized });
  } catch (err) {
    console.error('[api/admin/enquiries] GET error:', err);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch enquiries.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ ok: false, message: 'Method not allowed.' }, { status: 405 });
}
