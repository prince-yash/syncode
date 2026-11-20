import nodemailer from "nodemailer";
import { environment } from "../env.js";
import { logger } from "../logger.js";

export interface PasswordResetEmail {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface PasswordResetEmailSender {
  send(message: PasswordResetEmail): Promise<void>;
}

class DevelopmentEmailSender implements PasswordResetEmailSender {
  async send(message: PasswordResetEmail): Promise<void> {
    if (environment.NODE_ENV === "production") {
      throw new Error("Development email delivery is disabled in production.");
    }

    logger.info(
      {
        resetUrl: message.resetUrl,
        expiresInMinutes: message.expiresInMinutes,
      },
      "Development-only password reset link",
    );
  }
}

class SmtpEmailSender implements PasswordResetEmailSender {
  private readonly transporter = nodemailer.createTransport({
    host: environment.SMTP_HOST,
    port: environment.SMTP_PORT,
    secure:
      environment.SMTP_SECURE === undefined
        ? environment.SMTP_PORT === 465
        : environment.SMTP_SECURE === "true",
    requireTLS:
      environment.SMTP_SECURE === "true" || environment.SMTP_PORT === 465
        ? false
        : true,
    ...(environment.SMTP_USER && environment.SMTP_PASSWORD
      ? {
          auth: {
            user: environment.SMTP_USER,
            pass: environment.SMTP_PASSWORD,
          },
        }
      : {}),
  });

  async send(message: PasswordResetEmail): Promise<void> {
    if (!environment.SMTP_FROM) {
      throw new Error("SMTP_FROM is required for password-reset email.");
    }

    await this.transporter.sendMail({
      from: environment.SMTP_FROM,
      to: message.to,
      subject: "Reset your Syncode password",
      text: [
        "We received a request to reset your Syncode password.",
        `Use this link within ${message.expiresInMinutes} minutes:`,
        message.resetUrl,
        "If you did not request this, you can ignore this email.",
      ].join("\n\n"),
    });
  }
}

export function createPasswordResetEmailSender(): PasswordResetEmailSender {
  if (environment.SMTP_HOST) {
    return new SmtpEmailSender();
  }

  return new DevelopmentEmailSender();
}
