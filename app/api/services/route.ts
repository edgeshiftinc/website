import { NextResponse } from 'next/server';
import { getEnabledServices } from '@/lib/models';

// GET /api/services — public endpoint, returns only enabled services
// Used by the Services section on the homepage
export async function GET() {
  try {
    const services = await getEnabledServices();
    const serialized = services.map((s) => ({
      ...s,
      _id: s._id?.toString(),
      createdAt: s.createdAt?.toISOString(),
      updatedAt: s.updatedAt?.toISOString(),
    }));
    return NextResponse.json(
      { ok: true, services: serialized },
      {
        headers: {
          // Cache on CDN for 60 seconds, allow stale for 30s while revalidating
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (err) {
    console.error('[api/services] GET error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to load services.' }, { status: 500 });
  }
}
