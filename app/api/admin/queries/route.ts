import { NextRequest, NextResponse } from 'next/server';
import { getContactQueries } from '@/lib/models';

export async function GET(req: NextRequest) {
  // ── Simple auth check (replace with proper authentication in production) ──
  const authHeader = req.headers.get('authorization');
  const token = process.env.ADMIN_API_TOKEN || 'changeme';

  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return NextResponse.json(
      { ok: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const queries = await getContactQueries(100);
    return NextResponse.json({
      ok: true,
      count: queries.length,
      queries,
    });
  } catch (error) {
    console.error('[admin/queries] Error fetching queries:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch queries' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { ok: false, message: 'Method not allowed.' },
    { status: 405 }
  );
}
