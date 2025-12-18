import { MongoClient, Db } from "mongodb";

import { env } from "@/lib/env";

/**
 * Module-level cached client promise.
 * In serverless/edge environments, this persists across hot reloads in dev
 * and across invocations in production (within the same instance).
 */
let cachedClientPromise: Promise<MongoClient> | null = null;

export function getMongoClient(): Promise<MongoClient> {
  if (!cachedClientPromise) {
    const client = new MongoClient(env.mongodbUri, {
      maxPoolSize: 10,
    });
    cachedClientPromise = client.connect();
  }
  return cachedClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(env.mongodbDbName);
}
