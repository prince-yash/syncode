export type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

export interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: Date;
}

export type PublicUser = Omit<AuthUser, "status">;

export interface AuthAccount {
  user: AuthUser;
  passwordHash: string | null;
}

export interface SessionIdentity {
  id: string;
  userId: string;
  user: AuthUser;
}

export interface UserPreferences {
  theme: ThemePreference;
  editorFontSize: number;
  editorTabSize: number;
  editorLineNumbers: boolean;
  notifyRoomInvitations: boolean;
  notifyChallengeUpdates: boolean;
  notifyProductUpdates: boolean;
}

export interface ProfileUpdate {
  displayName?: string;
  username?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface PreferencesUpdate {
  theme?: ThemePreference;
  editorFontSize?: number;
  editorTabSize?: number;
  editorLineNumbers?: boolean;
  notifyRoomInvitations?: boolean;
  notifyChallengeUpdates?: boolean;
  notifyProductUpdates?: boolean;
}

export interface AuthRepository {
  findAccountByEmail(email: string): Promise<AuthAccount | null>;
  findAccountById(userId: string): Promise<AuthAccount | null>;
  createAccount(input: {
    email: string;
    username: string | null;
    displayName: string;
    passwordHash: string;
  }): Promise<AuthUser>;
  createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }): Promise<{ id: string }>;
  findSession(tokenHash: string, now: Date): Promise<SessionIdentity | null>;
  touchSession(sessionId: string, now: Date, olderThan: Date): Promise<void>;
  revokeSession(sessionId: string, userId: string, now: Date): Promise<void>;
  revokeAllSessions(
    userId: string,
    now: Date,
    exceptSessionId?: string,
  ): Promise<void>;
  createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
  }): Promise<void>;
  completePasswordReset(input: {
    tokenHash: string;
    passwordHash: string;
    now: Date;
  }): Promise<boolean>;
  changePassword(input: {
    userId: string;
    passwordHash: string;
    now: Date;
    exceptSessionId: string;
  }): Promise<void>;
  updateProfile(userId: string, update: ProfileUpdate): Promise<AuthUser>;
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(
    userId: string,
    update: PreferencesUpdate,
  ): Promise<UserPreferences>;
}
