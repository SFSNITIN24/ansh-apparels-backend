import type { Collection } from "mongodb";
import type { Product, ProductSize } from "@/types/product";

import { getDb } from "@/lib/mongo";

type ProductDoc = Omit<Product, "sizes"> & { sizes: unknown };

function normalizeSizes(raw: unknown): ProductSize[] {
  if (!Array.isArray(raw)) return [];

  // Legacy: ["S","M"] -> [{label:"S", quantity:999}, ...]
  if (raw.every((x) => typeof x === "string")) {
    return (raw as string[])
      .map((s) => String(s).trim())
      .filter(Boolean)
      .map((label) => ({ label, quantity: 999 }));
  }

  // New: [{label, quantity}] or legacy [{label, inStock}]
  const out: ProductSize[] = [];
  for (const item of raw) {
    const label = typeof (item as any)?.label === "string" ? (item as any).label.trim() : "";
    if (!label) continue;

    // quantity takes precedence, then derive from inStock boolean
    let quantity: number;
    if (typeof (item as any)?.quantity === "number") {
      quantity = (item as any).quantity;
    } else if (typeof (item as any)?.inStock === "boolean") {
      quantity = (item as any).inStock ? 999 : 0;
    } else if (typeof (item as any)?.stock === "number") {
      quantity = (item as any).stock;
    } else {
      quantity = 999;
    }

    out.push({ label, quantity });
  }

  // de-dupe by label (keep first)
  const seen = new Set<string>();
  return out.filter((s) => {
    const key = s.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeProduct(doc: any): Product {
  return {
    id: Number(doc.id),
    name: String(doc.name),
    slug: String(doc.slug),
    price: Number(doc.price),
    category: doc.category,
    sizes: normalizeSizes(doc.sizes),
    images: Array.isArray(doc.images) ? doc.images : [],
  } satisfies Product;
}

async function col(): Promise<Collection<ProductDoc>> {
  const db = await getDb();
  const c = db.collection<ProductDoc>("products");
  await c.createIndex({ id: 1 }, { unique: true });
  await c.createIndex({ slug: 1 }, { unique: true });
  return c;
}

export const productsRepository = {
  async findAll(): Promise<Product[]> {
    const c = await col();
    const docs = await c.find({}).sort({ id: 1 }).toArray();
    return docs.map(normalizeProduct);
  },
  async findBySlug(slug: string): Promise<Product | undefined> {
    const c = await col();
    const doc = await c.findOne({ slug });
    return doc ? normalizeProduct(doc) : undefined;
  },
  async findById(id: number): Promise<Product | undefined> {
    const c = await col();
    const doc = await c.findOne({ id });
    return doc ? normalizeProduct(doc) : undefined;
  },
  async create(input: Omit<Product, "id">): Promise<Product> {
    const c = await col();
    const last = await c.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = (last[0]?.id ?? 0) + 1;
    const product: Product = {
      id: nextId,
      ...input,
      sizes: normalizeSizes(input.sizes),
    };
    await c.insertOne(product as any);
    return product;
  },
  async update(id: number, patch: Partial<Omit<Product, "id">>): Promise<Product> {
    const c = await col();
    const res = await c.findOneAndUpdate(
      { id },
      { $set: patch },
      { returnDocument: "after" }
    );
    if (!res) throw new Error("Not found");
    return normalizeProduct(res);
  },
  async delete(id: number): Promise<boolean> {
    const c = await col();
    const res = await c.deleteOne({ id });
    return res.deletedCount === 1;
  },
  async deleteAll(): Promise<number> {
    const c = await col();
    const res = await c.deleteMany({});
    return res.deletedCount ?? 0;
  },
};


