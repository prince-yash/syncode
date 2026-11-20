import { z } from "zod";

const password = z.string().min(8).max(128);
const email = z
  .email()
  .max(320)
  .transform((value) => value.trim().toLowerCase());
const username = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-zA-Z0-9_]+$/)
  .transform((value) => value.toLowerCase());

export const registerSchema = z
  .object({
    email,
    username: username.optional(),
    displayName: z.string().trim().min(2).max(80),
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1).max(128),
  })
  .strict();

export const forgotPasswordSchema = z.object({ email }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(128),
    password,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: password,
  })
  .strict()
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current password.",
  });

export const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80).optional(),
    username: username.nullable().optional(),
    bio: z.string().trim().max(500).nullable().optional(),
    avatarUrl: z
      .union([
        z
          .url()
          .max(2048)
          .refine((value) =>
            ["http:", "https:"].includes(new URL(value).protocol),
          ),
        z.literal(""),
      ])
      .nullable()
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one profile field.",
  })
  .transform((value) => ({
    ...value,
    avatarUrl: value.avatarUrl === "" ? null : value.avatarUrl,
  }));

export const preferencesUpdateSchema = z
  .object({
    theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
    editorFontSize: z.number().int().min(10).max(32).optional(),
    editorTabSize: z.number().int().min(2).max(8).optional(),
    editorLineNumbers: z.boolean().optional(),
    notifyRoomInvitations: z.boolean().optional(),
    notifyChallengeUpdates: z.boolean().optional(),
    notifyProductUpdates: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one preference.",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PreferencesUpdateInput = z.infer<typeof preferencesUpdateSchema>;
