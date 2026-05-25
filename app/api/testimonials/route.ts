import { NextResponse } from 'next/server';
import { getEnabledTestimonials } from '@/lib/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const testimonials = await getEnabledTestimonials();
    const serialized = testimonials.map((t) => ({
      _id:      t._id?.toString(),
      company:  t.company,
      industry: t.industry,
      quote:    t.quote,
      rating:   t.rating ?? 5,
      order:    t.order,
      enabled:  t.enabled,
    }));
    const res = NextResponse.json({ ok: true, testimonials: serialized });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res;
  } catch (err) {
    console.error('[api/testimonials] GET error:', err);
    return NextResponse.json({ ok: false, testimonials: [] });
  }
}
