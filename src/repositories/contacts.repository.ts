import type { Collection } from "mongodb";
import type { ContactMessage } from "@/types/contact";

import { getDb } from "@/lib/mongo";

type ContactDoc = Omit<ContactMessage, "id"> & { _id: string };

async function col(): Promise<Collection<ContactDoc>> {
  const db = await getDb();
  const c = db.collection<ContactDoc>("contacts");
  await c.createIndex({ createdAt: -1 });
  return c;
}

export const contactsRepository = {
  async list(): Promise<ContactMessage[]> {
    const c = await col();
    const docs = await c.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  },
  async create(msg: ContactMessage): Promise<ContactMessage> {
    const c = await col();
    await c.insertOne({ _id: msg.id, ...msg });
    return msg;
  },
  async delete(id: string): Promise<boolean> {
    const c = await col();
    const res = await c.deleteOne({ _id: id });
    return res.deletedCount === 1;
  },
};


