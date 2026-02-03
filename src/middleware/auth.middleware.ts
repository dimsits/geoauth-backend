// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

type AuthedUser = {
  id: string;
  email?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

/**
 * JWT auth middleware.
 * Expects: Authorization: Bearer <token>
 * On success: attaches req.user = { id, email? }
 * On failure: responds 401 { error: "Unauthorized" }
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization") || req.header("authorization");
  if (!header) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [scheme, token] = parts;
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Misconfiguration: treat as unauthorized to avoid leaking server details.
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload | string;

    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sub = decoded.sub;
    const userId = typeof sub === "string" ? sub : "";

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const email = typeof decoded.email === "string" ? decoded.email : undefined;

    req.user = { id: userId, email };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export default authMiddleware;
