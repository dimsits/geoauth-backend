import { AppError } from "../middleware/error.middleware";
import { userRepository } from "../repositories/user.repo";
import { hashPassword, verifyPassword } from "../utils/password";
import { signJwt } from "../utils/jwt";

export type SafeUser = {
  id: string;
  email: string;
  createdAt?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
};

function invalidCredentials(): AppError {
  // Same response for "email not found" and "wrong password" (no account enumeration)
  return new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
}

export const authService = {
  /**
   * Login and return a JWT token.
   * Throws AppError(401) on invalid credentials.
   */
  async login(input: LoginInput): Promise<string> {
    const { email, password } = input;

    const user = await userRepository.findByEmail(email);
    if (!user) throw invalidCredentials();

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw invalidCredentials();

    const token = signJwt({
      sub: user.id,
      email: user.email,
    });

    return token;
  },

  /**
   * Register a new user.
   * Recommended: returns a JWT token (auto-login).
   * Throws AppError(409) if email already exists.
   */
  async register(input: RegisterInput): Promise<string> {
    const { email, password } = input;

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, "Email already registered", "EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(password);

    const created = await userRepository.create({
      email,
      passwordHash,
    });

    const token = signJwt({
      sub: created.id,
      email: created.email,
    });

    return token;
  },

  /**
   * Get current user (safe fields only).
   * Throws AppError(401) if user is missing.
   */
  async me(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }

    return {
      id: user.id,
      email: user.email,
      ...(user.createdAt ? { createdAt: user.createdAt } : {}),
    };
  },
};

export default authService;
