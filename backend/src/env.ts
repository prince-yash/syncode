import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  FRONTEND_ORIGIN: z
    .url()
    .refine((value) => {
      const url = new URL(value);
      return (
        url.pathname === "/" &&
        !url.search &&
        !url.hash &&
        !url.username &&
        !url.password
      );
    }, "FRONTEND_ORIGIN must be an origin without a path.")
    .transform((value) => new URL(value).origin)
    .optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(60).default(30),
  SMTP_HOST: optionalNonEmptyString,
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: optionalNonEmptyString,
  SMTP_PASSWORD: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  SMTP_FROM: optionalNonEmptyString,
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
});

const validatedEnvironmentSchema = environmentSchema.superRefine(
  (value, context) => {
    if (value.NODE_ENV === "production") {
      if (!value.FRONTEND_ORIGIN) {
        context.addIssue({
          code: "custom",
          path: ["FRONTEND_ORIGIN"],
          message: "FRONTEND_ORIGIN is required in production.",
        });
      } else if (new URL(value.FRONTEND_ORIGIN).protocol !== "https:") {
        context.addIssue({
          code: "custom",
          path: ["FRONTEND_ORIGIN"],
          message: "FRONTEND_ORIGIN must use HTTPS in production.",
        });
      }

      for (const key of ["SMTP_HOST", "SMTP_FROM"] as const) {
        if (!value[key]) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: `${key} is required in production.`,
          });
        }
      }
    }

    if (Boolean(value.SMTP_USER) !== Boolean(value.SMTP_PASSWORD)) {
      context.addIssue({
        code: "custom",
        path: ["SMTP_USER"],
        message: "SMTP_USER and SMTP_PASSWORD must be configured together.",
      });
    }
  },
);
export function parseEnvironment(input: NodeJS.ProcessEnv) {
  const parsed = validatedEnvironmentSchema.parse(input);
  return {
    ...parsed,
    FRONTEND_ORIGIN: parsed.FRONTEND_ORIGIN ?? "http://127.0.0.1:5173",
  };
}

export const environment = parseEnvironment(process.env);
