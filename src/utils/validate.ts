import net from "net";
import { AppError } from "../middleware/error.middleware";

/**
 * Ensures a value is a non-empty string after trimming.
 * Throws AppError(400) if invalid.
 */
export function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new AppError(400, `Invalid ${fieldName}`, "VALIDATION_ERROR");
  }
  const v = value.trim();
  if (!v) {
    throw new AppError(400, `Invalid ${fieldName}`, "VALIDATION_ERROR");
  }
  return v;
}

/**
 * Email normalization: trim + lowercase.
 * Returns null if not a string or empty after trim.
 */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email ? email : null;
}

/**
 * Pragmatic email validation.
 * Keeps it simple to avoid false negatives; DB uniqueness remains the real gate.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  if (email.length > 254) return false;
  // Basic pattern: local@domain.tld (no spaces)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Throws AppError(400) if email is missing/invalid.
 * Returns normalized email.
 */
export function assertEmail(value: unknown): string {
  const email = normalizeEmail(value);
  if (!email || !isValidEmail(email)) {
    throw new AppError(400, "Invalid email", "INVALID_EMAIL");
  }
  return email;
}

/**
 * Password rules for v1:
 * - string
 * - 8 to 72 chars (72 is safe upper bound for bcrypt input)
 * - not all whitespace
 */
export function isValidPassword(password: string): boolean {
  if (!password) return false;
  const trimmed = password.trim();
  if (!trimmed) return false;

  const len = password.length;
  if (len < 8) return false;
  if (len > 72) return false;

  return true;
}

/**
 * Throws AppError(400) if password is missing/invalid.
 * Returns the original password string (do not trim; hashing should use exact input).
 */
export function assertPassword(value: unknown): string {
  if (typeof value !== "string") {
    throw new AppError(400, "Invalid password", "INVALID_PASSWORD");
  }
  if (!isValidPassword(value)) {
    throw new AppError(400, "Invalid password", "INVALID_PASSWORD");
  }
  return value;
}

/**
 * Normalize user-provided IP input.
 * - trims
 * - removes surrounding brackets (e.g. "[::1]")
 * - strips IPv4 port (e.g. "1.2.3.4:8080" -> "1.2.3.4")
 * - converts IPv6-mapped IPv4 (::ffff:1.2.3.4 -> 1.2.3.4)
 */
export function normalizeIpInput(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let ip = value.trim();
  if (!ip) return null;

  if (ip.startsWith("[") && ip.endsWith("]")) {
    ip = ip.slice(1, -1).trim();
  }

  const lower = ip.toLowerCase();
  if (lower.startsWith("::ffff:")) {
    ip = ip.slice("::ffff:".length);
  }

  // Remove IPv6 zone index
  const zoneIndex = ip.indexOf("%");
  if (zoneIndex !== -1) {
    ip = ip.slice(0, zoneIndex);
  }

  // Remove port for IPv4 form only
  if (ip.includes(".") && ip.includes(":")) {
    const lastColon = ip.lastIndexOf(":");
    const maybePort = ip.slice(lastColon + 1);
    if (/^\d+$/.test(maybePort)) {
      ip = ip.slice(0, lastColon);
    }
  }

  ip = ip.trim();
  return ip || null;
}

/**
 * Validates IPv4/IPv6 using Node's built-in net.isIP.
 * Returns 0 (invalid), 4, or 6.
 */
export function ipVersion(ip: string): 0 | 4 | 6 {
  const v = net.isIP(ip);
  return (v === 4 || v === 6 ? v : 0) as 0 | 4 | 6;
}

export function isValidIp(ip: string): boolean {
  return ipVersion(ip) !== 0;
}

/**
 * Throws AppError(400) if IP is missing/invalid.
 * Returns normalized IP.
 */
export function assertIp(value: unknown): string {
  const ip = normalizeIpInput(value);
  if (!ip || !isValidIp(ip)) {
    throw new AppError(400, "Invalid IP address", "INVALID_IP");
  }
  return ip;
}

/**
 * Extract and validate common auth payload.
 * Helpful for register/login route handlers.
 */
export function parseAuthBody(body: unknown): { email: string; password: string } {
  if (typeof body !== "object" || body === null) {
    throw new AppError(400, "Invalid request body", "VALIDATION_ERROR");
  }

  const b = body as Record<string, unknown>;
  const email = assertEmail(b.email);
  const password = assertPassword(b.password);

  return { email, password };
}

export default {
  requireString,
  normalizeEmail,
  isValidEmail,
  assertEmail,
  isValidPassword,
  assertPassword,
  normalizeIpInput,
  ipVersion,
  isValidIp,
  assertIp,
  parseAuthBody,
};
