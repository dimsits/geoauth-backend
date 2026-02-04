// src/utils/jwt.ts
import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppError } from "../middleware/error.middleware";

export type JwtClaims = {
  sub: string; // user id
  email?: string;
};

const DEFAULT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = "7d";

function getJwtSecret(): jwt.Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "JWT secret is not configured", "JWT_MISCONFIG");
  }
  return secret;
}

function getJwtExpiresIn(): jwt.SignOptions["expiresIn"] {
  const exp = process.env.JWT_EXPIRES_IN?.trim();
  return exp && exp.length ? (exp as jwt.SignOptions["expiresIn"]) : DEFAULT_EXPIRES_IN;
}

/**
 * Sign a JWT for a user.
 * Used by services (login/register).
 */
export function signJwt(claims: JwtClaims): string {
  if (!claims?.sub) {
    throw new AppError(500, "Invalid JWT claims", "JWT_INVALID_CLAIMS");
  }

  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();

  // Put `sub` in the payload to avoid `subject` option typing issues.
  return jwt.sign(
    {
      sub: claims.sub,
      email: claims.email,
    },
    secret,
    { expiresIn }
  );
}

/**
 * Verify a JWT and return normalized claims.
 * Used by auth middleware.
 */
export function verifyJwt(token: string): JwtClaims {
  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload | string;

    if (typeof decoded === "string") {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const sub = decoded.sub;
    const userId = typeof sub === "string" ? sub : "";
    if (!userId) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const email = typeof decoded.email === "string" ? decoded.email : undefined;

    return { sub: userId, email };
  } catch {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
}

export default {
  signJwt,
  verifyJwt,
};
