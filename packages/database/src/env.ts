import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const databaseUrlSchema = z.string().refine((value) => {
  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === "postgresql:" &&
      parsedUrl.searchParams.get("sslmode") === "require" &&
      parsedUrl.hostname.includes("-pooler.")
    );
  } catch {
    return false;
  }
}, "Expected a Neon pooled PostgreSQL URL with sslmode=require.");

const databaseUrl = databaseUrlSchema.safeParse(process.env.DATABASE_URL);

if (!databaseUrl.success) {
  throw new Error(
    "DATABASE_URL must be a valid Neon pooled PostgreSQL URL with sslmode=require.",
  );
}

export const databaseEnvironment = { DATABASE_URL: databaseUrl.data };
