import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const defaultDb = process.env.VERCEL ? "file:/tmp/dev.db" : "file:./dev.db";
const databaseUrl = process.env.DATABASE_URL || defaultDb;
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

const url =
  databaseUrl.startsWith("libsql:") ||
  databaseUrl.startsWith("https:") ||
  databaseUrl.startsWith("http:") ||
  databaseUrl.startsWith("file:")
    ? databaseUrl
    : `file:${databaseUrl}`;

const adapter = new PrismaLibSql({
  url,
  ...(authToken ? { authToken } : {}),
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let initPromise: Promise<void> | null = null;
export async function ensureDatabaseTables(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS User (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS PredictionLog (
          id TEXT PRIMARY KEY NOT NULL,
          image TEXT NOT NULL,
          predictedLabel TEXT NOT NULL,
          confidence REAL NOT NULL,
          material TEXT NOT NULL,
          recyclable BOOLEAN NOT NULL,
          contamination REAL NOT NULL,
          cleaning TEXT NOT NULL,
          recommendation TEXT NOT NULL,
          explanation TEXT NOT NULL,
          alternatives TEXT,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Feedback (
          id TEXT PRIMARY KEY NOT NULL,
          image TEXT NOT NULL,
          predictedLabel TEXT NOT NULL,
          correctLabel TEXT NOT NULL,
          confidence REAL NOT NULL,
          userFeedback TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {
      console.warn("[prisma] table auto-migration note:", e);
    }
  })();
  return initPromise;
}
