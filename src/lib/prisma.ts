import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const DEFAULT_DATABASE_URL = "postgresql://neondb_owner:npg_O6Tsh9PcEkuy@ep-holy-glade-aztoy3v2-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  const connectionString = (rawUrl && rawUrl.trim().startsWith("postgres"))
    ? rawUrl.trim()
    : DEFAULT_DATABASE_URL;

  console.log("[Prisma] Initializing PrismaNeon adapter...");

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
