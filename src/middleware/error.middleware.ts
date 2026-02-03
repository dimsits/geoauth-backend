// src/middleware/error.middleware.ts
import type { NextFunction, Request, Response } from "express";

type ErrorResponse = {
  error: string;
  code?: string;
  details?: unknown;
};

export class AppError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Express global error handler.
 * Place AFTER all routes (and after a 404 handler, if you have one).
 */
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const isProd = process.env.NODE_ENV === "production";

  // -----------------------
  // Helpers
  // -----------------------
  const respond = (statusCode: number, payload: ErrorResponse) => {
    if (res.headersSent) return;
    res.status(statusCode).json(payload);
  };

  const safeLog = (e: unknown) => {
    // Avoid logging tokens/passwords; only log metadata + error basics.
    // Customize if you have a logger (pino/winston).
    const meta = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      userId: (req as any).user?.id,
    };

    if (!isProd) {
      // eslint-disable-next-line no-console
      console.error("[error]", meta, e);
    } else {
      // eslint-disable-next-line no-console
      console.error("[error]", meta, e instanceof Error ? e.message : e);
    }
  };

  // -----------------------
  // 1) AppError (known)
  // -----------------------
  if (err instanceof AppError) {
    safeLog(err);

    const payload: ErrorResponse = {
      error: err.message || "Error",
      ...(err.code ? { code: err.code } : {}),
      ...(!isProd && err.details !== undefined ? { details: err.details } : {}),
    };

    return respond(err.statusCode, payload);
  }

  // -----------------------
  // 2) Express JSON parse error
  // -----------------------
  // express.json() can throw SyntaxError with status 400 / type 'entity.parse.failed'
  if (err instanceof SyntaxError) {
    const anyErr = err as any;
    if (anyErr?.status === 400 || anyErr?.type === "entity.parse.failed") {
      safeLog(err);
      return respond(400, {
        error: "Invalid JSON",
        code: "INVALID_JSON",
        ...(!isProd ? { details: err.message } : {}),
      });
    }
  }

  // -----------------------
  // 3) Postgres unique constraint (common for register)
  // -----------------------
  // Many Postgres drivers surface SQLSTATE code '23505' for unique violations.
  if (typeof err === "object" && err !== null) {
    const anyErr = err as any;
    const pgCode = anyErr?.code;

    if (pgCode === "23505") {
      safeLog(err);

      // If you can detect it's the users.email unique constraint, map to EMAIL_EXISTS.
      // Different libs put constraint name in different fields: constraint, detail, meta, etc.
      const text = String(anyErr?.detail || anyErr?.message || "").toLowerCase();
      const looksLikeEmailUnique =
        text.includes("email") && (text.includes("already exists") || text.includes("duplicate"));

      return respond(409, {
        error: looksLikeEmailUnique ? "Email already registered" : "Conflict",
        code: looksLikeEmailUnique ? "EMAIL_EXISTS" : "CONFLICT",
        ...(!isProd ? { details: anyErr?.detail || anyErr?.message } : {}),
      });
    }
  }

  // -----------------------
  // 4) Fallback: unknown error
  // -----------------------
  safeLog(err);

  const message = err instanceof Error ? err.message : "Unknown error";
  return respond(500, {
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
    ...(!isProd ? { details: message } : {}),
  });
}

export default errorMiddleware;
