export interface User {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UserPreferences {
  theme: "LIGHT" | "DARK" | "SYSTEM";
  editorFontSize: number;
  editorTabSize: number;
  editorLineNumbers: boolean;
  notifyRoomInvitations: boolean;
  notifyChallengeUpdates: boolean;
  notifyProductUpdates: boolean;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the Syncode API. Check your connection.",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorPayload =
      typeof payload === "object" && payload !== null && "error" in payload
        ? payload.error
        : null;
    const error =
      typeof errorPayload === "object" && errorPayload !== null
        ? errorPayload
        : null;
    throw new ApiError(
      response.status,
      error && "message" in error && typeof error.message === "string"
        ? error.message
        : "The request could not be completed.",
      error && "code" in error && typeof error.code === "string"
        ? error.code
        : undefined,
    );
  }

  return payload as T;
}

export const api = {
  me: () => request<{ user: User }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (input: { email: string; displayName: string; password: string }) =>
    request<{ user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  logoutAll: () => request<void>("/api/auth/logout-all", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  updateProfile: (input: {
    displayName?: string;
    username?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  }) =>
    request<{ user: User }>("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  getPreferences: () =>
    request<{ preferences: UserPreferences }>("/api/auth/preferences"),
  updatePreferences: (input: Partial<UserPreferences>) =>
    request<{ preferences: UserPreferences }>("/api/auth/preferences", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
