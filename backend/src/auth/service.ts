import { environment } from "../env.js";
import { logger } from "../logger.js";
import { AuthError } from "./errors.js";
import {
  createOpaqueToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./crypto.js";
import type { PasswordResetEmailSender } from "./email.js";
import type {
  AuthRepository,
  AuthUser,
  PreferencesUpdate,
  ProfileUpdate,
  SessionIdentity,
} from "./types.js";

const SESSION_COOKIE = "syncode_session";
const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;
const dummyPasswordHash = hashPassword(createOpaqueToken());

export interface IssuedSession {
  token: string;
  expiresAt: Date;
}

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly emailSender: PasswordResetEmailSender,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async register(input: {
    email: string;
    username?: string;
    displayName: string;
    password: string;
  }): Promise<{ user: AuthUser; session: IssuedSession }> {
    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.createAccount({
      email: input.email.trim().toLowerCase(),
      username: input.username?.trim().toLowerCase() ?? null,
      displayName: input.displayName,
      passwordHash,
    });

    return { user, session: await this.issueSession(user.id) };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: AuthUser; session: IssuedSession }> {
    const account = await this.repository.findAccountByEmail(
      input.email.trim().toLowerCase(),
    );
    const passwordHash = account?.passwordHash ?? (await dummyPasswordHash);
    const passwordMatches = await verifyPassword(passwordHash, input.password);
    if (!account || account.user.status !== "ACTIVE" || !passwordMatches) {
      throw new AuthError(
        401,
        "INVALID_CREDENTIALS",
        "Email or password is incorrect.",
      );
    }

    return {
      user: account.user,
      session: await this.issueSession(account.user.id),
    };
  }

  async resolveSession(token: string): Promise<SessionIdentity | null> {
    const now = this.now();
    const session = await this.repository.findSession(hashToken(token), now);
    if (session) {
      await this.repository.touchSession(
        session.id,
        now,
        new Date(now.getTime() - SESSION_TOUCH_INTERVAL_MS),
      );
    }
    return session;
  }

  async logout(session: SessionIdentity | null): Promise<void> {
    if (session) {
      await this.repository.revokeSession(
        session.id,
        session.userId,
        this.now(),
      );
    }
  }

  async logoutAll(session: SessionIdentity): Promise<void> {
    await this.repository.revokeAllSessions(session.userId, this.now());
  }

  async requestPasswordReset(email: string): Promise<void> {
    const account = await this.repository.findAccountByEmail(
      email.trim().toLowerCase(),
    );
    if (!account || account.user.status !== "ACTIVE" || !account.user.email) {
      return;
    }

    const token = createOpaqueToken();
    const expiresAt = new Date(
      this.now().getTime() + environment.RESET_TOKEN_TTL_MINUTES * 60_000,
    );
    await this.repository.createPasswordResetToken({
      userId: account.user.id,
      tokenHash: hashToken(token),
      expiresAt,
      createdAt: this.now(),
    });

    const resetUrl = new URL("/reset-password", environment.FRONTEND_ORIGIN);
    resetUrl.searchParams.set("token", token);
    try {
      await this.emailSender.send({
        to: account.user.email,
        resetUrl: resetUrl.toString(),
        expiresInMinutes: environment.RESET_TOKEN_TTL_MINUTES,
      });
    } catch (error) {
      logger.warn(
        { errorName: error instanceof Error ? error.name : "UnknownError" },
        "Password reset email delivery failed",
      );
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const changed = await this.repository.completePasswordReset({
      tokenHash: hashToken(token),
      passwordHash: await hashPassword(password),
      now: this.now(),
    });
    if (!changed) {
      throw new AuthError(
        400,
        "INVALID_RESET_TOKEN",
        "The reset link is invalid or expired.",
      );
    }
  }

  async changePassword(
    session: SessionIdentity,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const account = await this.repository.findAccountById(session.userId);
    if (
      !account?.passwordHash ||
      !(await verifyPassword(account.passwordHash, currentPassword))
    ) {
      throw new AuthError(
        400,
        "INVALID_CURRENT_PASSWORD",
        "Current password is incorrect.",
      );
    }

    await this.repository.changePassword({
      userId: session.userId,
      passwordHash: await hashPassword(newPassword),
      now: this.now(),
      exceptSessionId: session.id,
    });
  }

  updateProfile(userId: string, update: ProfileUpdate): Promise<AuthUser> {
    return this.repository.updateProfile(userId, {
      ...update,
      ...(update.username
        ? { username: update.username.trim().toLowerCase() }
        : {}),
    });
  }

  getPreferences(userId: string) {
    return this.repository.getPreferences(userId);
  }

  updatePreferences(userId: string, update: PreferencesUpdate) {
    return this.repository.updatePreferences(userId, update);
  }

  private async issueSession(userId: string): Promise<IssuedSession> {
    const token = createOpaqueToken();
    const now = this.now();
    const expiresAt = new Date(
      now.getTime() + environment.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.repository.createSession({
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      createdAt: now,
    });
    return { token, expiresAt };
  }
}

export { SESSION_COOKIE };
