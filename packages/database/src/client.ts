import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { databaseEnvironment } from "./env.js";

const globalForPrisma = globalThis as typeof globalThis & {
  syncodePrisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: databaseEnvironment.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

export const prisma =
  globalForPrisma.syncodePrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.syncodePrisma = prisma;
}
