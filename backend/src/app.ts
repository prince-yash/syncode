import express from "express";
import type { ErrorRequestHandler } from "express";
import { pinoHttp } from "pino-http";
import { logger } from "./logger.js";
import { AuthError } from "./auth/errors.js";
import { createAuthRouter } from "./auth/router.js";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (request) => ({
        id: request.id,
        method: request.method,
        url: request.url,
      }),
    },
  }),
);

app.get("/api/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api/auth", createAuthRouter());

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "Not found" });
});

const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  void _next;
  if (error instanceof AuthError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    response.status(409).json({
      error: {
        code: "ALREADY_EXISTS",
        message: "An account with those details already exists.",
      },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    response.status(413).json({
      error: {
        code: "REQUEST_TOO_LARGE",
        message: "Request body is too large.",
      },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    response.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  ) {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "The requested account data was not found.",
      },
    });
    return;
  }

  logger.error(
    {
      errorName: error instanceof Error ? error.name : "UnknownError",
    },
    "API request failed",
  );
  response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
  });
};

app.use(errorHandler);
