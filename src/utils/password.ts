import bcrypt from "bcrypt";

/**
 * Default bcrypt cost.
 * You can override with BCRYPT_COST in env if desired.
 */
const DEFAULT_BCRYPT_COST = 12;

function getBcryptCost(): number {
  const raw = process.env.BCRYPT_COST;
  if (!raw) return DEFAULT_BCRYPT_COST;

  const cost = Number(raw);
  if (Number.isNaN(cost) || cost < 8 || cost > 15) {
    // Fail-safe: keep within a sane range
    return DEFAULT_BCRYPT_COST;
  }

  return cost;
}

/**
 * Hash a plaintext password.
 * - Uses bcrypt with a configurable cost
 * - Never trims or mutates the password
 */
export async function hashPassword(password: string): Promise<string> {
  const cost = getBcryptCost();
  return bcrypt.hash(password, cost);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 * Returns true if match, false otherwise.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  // bcrypt.compare already performs constant-time comparison
  return bcrypt.compare(password, passwordHash);
}

export default {
  hashPassword,
  verifyPassword,
};
