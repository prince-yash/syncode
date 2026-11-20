import { Router, type Request, type Response } from "express";
import { environment } from "../env.js";
import { AuthError } from "./errors.js";
import { createPasswordResetEmailSender } from "./email.js";
import { PrismaAuthRepository } from "./prisma-repository.js";
import { createRateLimiter } from "./rate-limit.js";
import { AuthService, SESSION_COOKIE } from "./service.js";
import type { AuthUser, SessionIdentity } from "./types.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  preferencesUpdateSchema,
  profileUpdateSchema,
  registerSchema,
  resetPasswordSchema,
} from "./validation.js";

const authService = new AuthService(
  new PrismaAuthRepository(),
  createPasswordResetEmailSender(),
);

const sessionCookieOptions = {
  httpOnly: true,
  secure: environment.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
};

function setSessionCookie(response: Response, token: string, expiresAt: Date) {
  response.cookie(SESSION_COOKIE, token, {
    ...sessionCookieOptions,
    expires: expiresAt,
  });
}

function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE, sessionCookieOptions);
}

function sessionFrom(response: Response): SessionIdentity {
  return response.locals.session as SessionIdentity;
}

function parseBody<T>(
  schema: {
    safeParse: (
      input: unknown,
    ) => { success: true; data: T } | { success: false };
  },
  request: Request,
): T {
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) {
    throw new AuthError(400, "INVALID_REQUEST", "Request data is invalid.");
  }
  return parsed.data;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) {
    return null;
  }

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) {
      continue;
    }
    const value = part.slice(separator + 1).trim();
    return /^[A-Za-z0-9_-]{40,64}$/.test(value) ? value : null;
  }

  return null;
}

function requireOrigin(
  request: Request,
  _response: Response,
  next: (error?: unknown) => void,
) {
  const origin = request.get("origin");
  const isLoopbackDevelopmentOrigin =
    environment.NODE_ENV !== "production" &&
    (origin === "http://localhost:5173" || origin === "http://127.0.0.1:5173");

  if (origin !== environment.FRONTEND_ORIGIN && !isLoopbackDevelopmentOrigin) {
    next(
      new AuthError(403, "INVALID_ORIGIN", "Request origin is not allowed."),
    );
    return;
  }
  next();
}

function requireSession(service: AuthService) {
  return async (
    request: Request,
    response: Response,
    next: (error?: unknown) => void,
  ) => {
    try {
      const token = readCookie(request, SESSION_COOKIE);
      const session = token ? await service.resolveSession(token) : null;
      if (!session) {
        next(new AuthError(401, "UNAUTHENTICATED", "Sign in to continue."));
        return;
      }
      response.locals.session = session;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

export function createAuthRouter(service: AuthService = authService) {
  const router = Router();
  const requireAuth = requireSession(service);

  router.use((request, _response, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      requireOrigin(request, _response, next);
      return;
    }
    next();
  });

  router.post(
    "/register",
    createRateLimiter(5, 15 * 60 * 1000),
    async (request, response) => {
      const input = parseBody(registerSchema, request);
      const { user, session } = await service.register(input);
      setSessionCookie(response, session.token, session.expiresAt);
      response.status(201).json({ user: publicUser(user) });
    },
  );

  router.post(
    "/login",
    createRateLimiter(10, 15 * 60 * 1000),
    async (request, response) => {
      const input = parseBody(loginSchema, request);
      const { user, session } = await service.login(input);
      setSessionCookie(response, session.token, session.expiresAt);
      response.json({ user: publicUser(user) });
    },
  );

  router.post("/logout", async (request, response) => {
    const token = readCookie(request, SESSION_COOKIE);
    const session = token ? await service.resolveSession(token) : null;
    await service.logout(session);
    clearSessionCookie(response);
    response.status(204).end();
  });

  router.post("/logout-all", requireAuth, async (_request, response) => {
    await service.logoutAll(sessionFrom(response));
    clearSessionCookie(response);
    response.status(204).end();
  });

  router.get("/me", requireAuth, (_request, response) => {
    response.json({ user: publicUser(sessionFrom(response).user) });
  });

  router.post(
    "/forgot-password",
    createRateLimiter(5, 60 * 60 * 1000),
    async (request, response) => {
      const { email } = parseBody(forgotPasswordSchema, request);
      await service.requestPasswordReset(email);
      response.json({
        message:
          "If an account exists for that email, a reset link has been sent.",
      });
    },
  );

  router.post(
    "/reset-password",
    createRateLimiter(10, 60 * 60 * 1000),
    async (request, response) => {
      const { token, password } = parseBody(resetPasswordSchema, request);
      await service.resetPassword(token, password);
      clearSessionCookie(response);
      response.status(204).end();
    },
  );

  router.post(
    "/change-password",
    createRateLimiter(10, 15 * 60 * 1000),
    requireAuth,
    async (request, response) => {
      const { currentPassword, newPassword } = parseBody(
        changePasswordSchema,
        request,
      );
      await service.changePassword(
        sessionFrom(response),
        currentPassword,
        newPassword,
      );
      response.status(204).end();
    },
  );

  router.patch("/profile", requireAuth, async (request, response) => {
    const update = parseBody(profileUpdateSchema, request);
    const user = await service.updateProfile(
      sessionFrom(response).userId,
      update,
    );
    response.json({ user: publicUser(user) });
  });

  router.get("/preferences", requireAuth, async (_request, response) => {
    const preferences = await service.getPreferences(
      sessionFrom(response).userId,
    );
    response.json({ preferences });
  });

  router.patch("/preferences", requireAuth, async (request, response) => {
    const update = parseBody(preferencesUpdateSchema, request);
    const preferences = await service.updatePreferences(
      sessionFrom(response).userId,
      update,
    );
    response.json({ preferences });
  });

  return router;
}
