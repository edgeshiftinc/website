import { ObjectId, WithId } from 'mongodb';
import { connectionToDatabase } from './db';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ContactQuery {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  ipAddress: string;
  createdAt: Date;
}

export interface ServiceDoc {
  _id?: ObjectId;
  title: string;
  tag: string;
  tagline: string;
  description: string;
  highlights: string[];
  order: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Product Section types ─────────────────────────────────────────────────────
// One document = one full product section on the page (e.g. Argus).
// The section renders as: header → hero card → feature grid → stats strip.

export interface ProductFeature {
  icon: string;       // emoji or short string
  title: string;
  desc: string;
}

export interface ProductStat {
  value: string;      // e.g. "<1s", "99.9%"
  label: string;      // e.g. "Alert Latency"
}

export interface ProductHeroCard {
  label: string;          // small eyebrow text e.g. "Flagship Product"
  title: string;          // large title e.g. "See everything.\nMiss nothing."
  body: string[];         // array of paragraph strings (split by \n\n in admin)
  ctaText: string;        // button text e.g. "Request Early Access"
  ctaHref: string;        // link e.g. "#contact"
}

export interface ProductSection {
  _id?: ObjectId;
  slug: string;           // unique key, used as HTML section id e.g. "argus"
  eyebrow: string;        // above title e.g. "Our Product"
  title: string;          // main heading e.g. "Meet ARGUS"
  titleAccent: string;    // the accented word inside title e.g. "ARGUS"
  subtitle: string;       // paragraph under title
  heroCard: ProductHeroCard;
  features: ProductFeature[];
  stats: ProductStat[];
  order: number;          // display order relative to other product sections
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Contact helpers ───────────────────────────────────────────────────────────

export async function saveContactQuery(
  data: Omit<ContactQuery, '_id' | 'createdAt'>
): Promise<ObjectId | null> {
  try {
    const { db } = await connectionToDatabase();
    const col = db.collection<ContactQuery>('contact_queries');
    const result = await col.insertOne({ ...data, createdAt: new Date() });
    return result.insertedId;
  } catch (err) {
    console.error('[models] saveContactQuery error:', err);
    throw err;
  }
}

export async function getContactQueries(limit = 100): Promise<WithId<ContactQuery>[]> {
  try {
    const { db } = await connectionToDatabase();
    const col = db.collection<ContactQuery>('contact_queries');
    return col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  } catch (err) {
    console.error('[models] getContactQueries error:', err);
    throw err;
  }
}

// ── Services helpers ──────────────────────────────────────────────────────────

export async function getAllServices(): Promise<WithId<ServiceDoc>[]> {
  const { db } = await connectionToDatabase();
  return db.collection<ServiceDoc>('services').find({}).sort({ order: 1 }).toArray();
}

export async function getEnabledServices(): Promise<WithId<ServiceDoc>[]> {
  const { db } = await connectionToDatabase();
  return db.collection<ServiceDoc>('services').find({ enabled: true }).sort({ order: 1 }).toArray();
}

export async function createService(
  data: Omit<ServiceDoc, '_id' | 'createdAt' | 'updatedAt'>
): Promise<ObjectId> {
  const { db } = await connectionToDatabase();
  const now = new Date();
  const result = await db.collection<ServiceDoc>('services').insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId;
}

export async function updateService(
  id: string,
  data: Partial<Omit<ServiceDoc, '_id' | 'createdAt'>>
): Promise<boolean> {
  const { db } = await connectionToDatabase();
  const result = await db.collection<ServiceDoc>('services').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

export async function deleteService(id: string): Promise<boolean> {
  const { db } = await connectionToDatabase();
  const result = await db.collection<ServiceDoc>('services').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// ── Product Section helpers ───────────────────────────────────────────────────

export async function getAllProducts(): Promise<WithId<ProductSection>[]> {
  const { db } = await connectionToDatabase();
  return db.collection<ProductSection>('products').find({}).sort({ order: 1 }).toArray();
}

export async function getEnabledProducts(): Promise<WithId<ProductSection>[]> {
  const { db } = await connectionToDatabase();
  return db
    .collection<ProductSection>('products')
    .find({ enabled: true })
    .sort({ order: 1 })
    .toArray();
}

export async function getProductBySlug(slug: string): Promise<WithId<ProductSection> | null> {
  const { db } = await connectionToDatabase();
  return db.collection<ProductSection>('products').findOne({ slug });
}

export async function createProduct(
  data: Omit<ProductSection, '_id' | 'createdAt' | 'updatedAt'>
): Promise<ObjectId> {
  const { db } = await connectionToDatabase();
  const now = new Date();
  const result = await db
    .collection<ProductSection>('products')
    .insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<ProductSection, '_id' | 'createdAt'>>
): Promise<boolean> {
  const { db } = await connectionToDatabase();
  const result = await db.collection<ProductSection>('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { db } = await connectionToDatabase();
  const result = await db
    .collection<ProductSection>('products')
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
