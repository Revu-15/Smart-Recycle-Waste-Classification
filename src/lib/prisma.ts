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
