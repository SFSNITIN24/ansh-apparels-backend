import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";

import { getDb } from "@/lib/mongo";

export type StoredFile = {
  id: string;
  filename: string;
  contentType: string;
  length: number;
};

function bufferToNodeStream(buf: Buffer) {
  return Readable.from(buf);
}

export async function uploadImageToGridFS(file: File): Promise<StoredFile> {
  const db = await getDb();
  const bucket = new GridFSBucket(db, { bucketName: "uploads" });

  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);

  const filename = file.name || `image-${Date.now()}`;
  const contentType = file.type || "application/octet-stream";

  const uploadStream = bucket.openUploadStream(filename, {
    contentType,
    metadata: { contentType },
  });

  await new Promise<void>((resolve, reject) => {
    bufferToNodeStream(buf)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve());
  });

  const id = String(uploadStream.id);
  return { id, filename, contentType, length: buf.length };
}

export async function openGridFSDownloadStream(id: string) {
  const db = await getDb();
  const bucket = new GridFSBucket(db, { bucketName: "uploads" });
  const oid = new ObjectId(id);
  return bucket.openDownloadStream(oid);
}

export async function getGridFSFileInfo(id: string): Promise<{
  filename?: string;
  contentType?: string;
  length?: number;
} | null> {
  const db = await getDb();
  const oid = new ObjectId(id);
  const files = db.collection<any>("uploads.files");
  const doc = await files.findOne({ _id: oid });
  if (!doc) return null;
  return {
    filename: doc.filename,
    contentType: doc.contentType || doc?.metadata?.contentType,
    length: doc.length,
  };
}

export async function deleteGridFSFile(id: string): Promise<boolean> {
  const db = await getDb();
  const bucket = new GridFSBucket(db, { bucketName: "uploads" });
  const oid = new ObjectId(id);
  try {
    await bucket.delete(oid);
    return true;
  } catch {
    return false;
  }
}


