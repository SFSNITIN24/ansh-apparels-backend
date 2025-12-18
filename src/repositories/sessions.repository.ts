import type { Collection } from "mongodb";

import { getDb } from "@/lib/mongo";

type SessionDoc = {
  _id: string; // sessionId
  userId: string;
  createdAt: number;
};

async function col(): Promise<Collection<SessionDoc>> {
  const db = await getDb();
  const c = db.collection<SessionDoc>("sessions");
  await c.createIndex({ userId: 1 });
  return c;
}

export const sessionsRepository = {
  async create(sessionId: string, userId: string) {
    const c = await col();
    await c.insertOne({ _id: sessionId, userId, createdAt: Date.now() });
  },
  async getUserId(sessionId: string): Promise<string | null> {
    const c = await col();
    const doc = await c.findOne({ _id: sessionId });
    return doc?.userId ?? null;
  },
  async delete(sessionId: string) {
    const c = await col();
    await c.deleteOne({ _id: sessionId });
  },
};


