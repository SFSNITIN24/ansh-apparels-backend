import type { Collection } from "mongodb";
import type { User, UserRole } from "@/types/user";

import { getDb } from "@/lib/mongo";

type UserDoc = Omit<User, "id"> & { _id: string } & { id?: string };

async function col(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  const c = db.collection<UserDoc>("users");
  await c.createIndex({ email: 1 }, { unique: true });
  return c;
}

function normalizeRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "user";
}

export const usersRepository = {
  async list(): Promise<User[]> {
    const c = await col();
    const docs = await c.find({}).toArray();
    return docs.map((doc) => {
      // Older documents may contain both `_id` and `id` if they were inserted with `{ _id: user.id, ...user }`.
      // Normalize to a single `id` field in the returned model.
      const { _id, id: _ignored, ...rest } = doc as any;
      return { id: _id, ...rest, role: normalizeRole((rest as any).role) };
    });
  },
  async findByEmail(email: string): Promise<User | null> {
    const c = await col();
    const doc = await c.findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    const { _id, id: _ignored, ...rest } = doc as any;
    return { id: _id, ...rest, role: normalizeRole((rest as any).role) };
  },
  async findById(id: string): Promise<User | null> {
    const c = await col();
    const doc = await c.findOne({ _id: id });
    if (!doc) return null;
    const { _id, id: _ignored, ...rest } = doc as any;
    return { id: _id, ...rest, role: normalizeRole((rest as any).role) };
  },
  async create(user: User): Promise<User> {
    const c = await col();
    const { id, ...withoutId } = user;
    await c.insertOne({
      _id: id,
      ...withoutId,
      email: user.email.toLowerCase(),
      role: normalizeRole(user.role),
    });
    return user;
  },
  async setRole(id: string, role: UserRole): Promise<User> {
    const c = await col();
    const updated = await c.findOneAndUpdate(
      { _id: id },
      { $set: { role: normalizeRole(role) } },
      { returnDocument: "after" }
    );
    if (!updated) throw new Error("Not found");
    const { _id, id: _ignored, ...rest } = updated as any;
    return { id: _id, ...rest, role: normalizeRole((rest as any).role) };
  },
};


