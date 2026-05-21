import { NextResponse } from 'next/server';
import { getEnabledTestimonials } from '@/lib/models';

export async function GET() {
  try {
    const testimonials = await getEnabledTestimonials();
    const serialized = testimonials.map((t) => ({
      _id: t._id?.toString(),
      company: t.company,
      industry: t.industry,
      quote: t.quote,
      rating: t.rating ?? 5,
      order: t.order,
    }));
    return NextResponse.json({ ok: true, testimonials: serialized });
  } catch (err) {
    console.error('[api/testimonials] GET error:', err);
    return NextResponse.json({ ok: false, testimonials: [] });
  }
}
