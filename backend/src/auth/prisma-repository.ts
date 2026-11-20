import { prisma } from "@syncode/database";
import type {
  AuthAccount,
  AuthRepository,
  AuthUser,
  PreferencesUpdate,
  ProfileUpdate,
  SessionIdentity,
  UserPreferences,
} from "./types.js";

function mapUser(user: {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function mapPreferences(preferences: {
  theme: "LIGHT" | "DARK" | "SYSTEM";
  editorFontSize: number;
  editorTabSize: number;
  editorLineNumbers: boolean;
  notifyRoomInvitations: boolean;
  notifyChallengeUpdates: boolean;
  notifyProductUpdates: boolean;
}): UserPreferences {
  return preferences;
}

export class PrismaAuthRepository implements AuthRepository {
  async findAccountByEmail(email: string): Promise<AuthAccount | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { credential: true },
    });

    return user
      ? {
          user: mapUser(user),
          passwordHash: user.credential?.passwordHash ?? null,
        }
      : null;
  }

  async findAccountById(userId: string): Promise<AuthAccount | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { credential: true },
    });

    return user
      ? {
          user: mapUser(user),
          passwordHash: user.credential?.passwordHash ?? null,
        }
      : null;
  }

  async createAccount(input: {
    email: string;
    username: string | null;
    displayName: string;
    passwordHash: string;
  }): Promise<AuthUser> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        displayName: input.displayName,
        credential: { create: { passwordHash: input.passwordHash } },
      },
    });

    return mapUser(user);
  }

  createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }): Promise<{ id: string }> {
    return prisma.userSession.create({
      data: input,
      select: { id: true },
    });
  }

  async findSession(
    tokenHash: string,
    now: Date,
  ): Promise<SessionIdentity | null> {
    const session = await prisma.userSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
        user: { status: "ACTIVE" },
      },
      include: { user: true },
    });

    return session
      ? { id: session.id, userId: session.userId, user: mapUser(session.user) }
      : null;
  }

  async touchSession(
    sessionId: string,
    now: Date,
    olderThan: Date,
  ): Promise<void> {
    await prisma.userSession.updateMany({
      where: {
        id: sessionId,
        OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: olderThan } }],
      },
      data: { lastSeenAt: now },
    });
  }

  async revokeSession(
    sessionId: string,
    userId: string,
    now: Date,
  ): Promise<void> {
    await prisma.userSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async revokeAllSessions(
    userId: string,
    now: Date,
    exceptSessionId?: string,
  ): Promise<void> {
    await prisma.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: now },
    });
  }

  async createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }): Promise<void> {
    await prisma.passwordResetToken.create({ data: input });
  }

  async completePasswordReset(input: {
    tokenHash: string;
    passwordHash: string;
    now: Date;
  }): Promise<boolean> {
    return prisma.$transaction(async (transaction) => {
      const token = await transaction.passwordResetToken.findUnique({
        where: { tokenHash: input.tokenHash },
        select: { id: true, userId: true, consumedAt: true, expiresAt: true },
      });

      if (!token || token.consumedAt || token.expiresAt <= input.now) {
        return false;
      }

      const consumed = await transaction.passwordResetToken.updateMany({
        where: {
          id: token.id,
          consumedAt: null,
          expiresAt: { gt: input.now },
        },
        data: { consumedAt: input.now },
      });

      if (consumed.count !== 1) {
        return false;
      }

      await transaction.passwordCredential.update({
        where: { userId: token.userId },
        data: {
          passwordHash: input.passwordHash,
          passwordUpdatedAt: input.now,
        },
      });
      await transaction.passwordResetToken.updateMany({
        where: { userId: token.userId, consumedAt: null },
        data: { consumedAt: input.now },
      });
      await transaction.userSession.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: input.now },
      });

      return true;
    });
  }

  async changePassword(input: {
    userId: string;
    passwordHash: string;
    now: Date;
    exceptSessionId: string;
  }): Promise<void> {
    await prisma.$transaction([
      prisma.passwordCredential.update({
        where: { userId: input.userId },
        data: {
          passwordHash: input.passwordHash,
          passwordUpdatedAt: input.now,
        },
      }),
      prisma.userSession.updateMany({
        where: {
          userId: input.userId,
          revokedAt: null,
          id: { not: input.exceptSessionId },
        },
        data: { revokedAt: input.now },
      }),
    ]);
  }

  async updateProfile(
    userId: string,
    update: ProfileUpdate,
  ): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId, status: "ACTIVE" },
      data: update,
    });

    return mapUser(user);
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return mapPreferences(preferences);
  }

  async updatePreferences(
    userId: string,
    update: PreferencesUpdate,
  ): Promise<UserPreferences> {
    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...update },
      update,
    });

    return mapPreferences(preferences);
  }
}
