import { NextResponse } from 'next/server';
import { getEnabledProducts } from '@/lib/models';

export async function GET() {
  try {
    const products = await getEnabledProducts();
    const serialized = products.map((p) => ({
      ...p,
      _id: p._id?.toString(),
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));
    return NextResponse.json(
      { ok: true, products: serialized },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (err) {
    console.error('[api/products] GET error:', err);
    return NextResponse.json({ ok: false, message: 'Failed to load products.' }, { status: 500 });
  }
}
