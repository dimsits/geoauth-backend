import { prisma } from "../lib/prisma";

export type AuthUserRow = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt?: string;
};

export type CreateUserInput = {
  email: string;
  passwordHash: string;
};

export const userRepository = {
  /**
   * Find a user by email (used by login/register).
   * Returns null if not found.
   */
  async findByEmail(email: string): Promise<AuthUserRow | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    return user
      ? {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
        }
      : null;
  },

  /**
   * Find a user by id (used by /me).
   * Returns null if not found.
   */
  async findById(id: string): Promise<AuthUserRow | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    return user
      ? {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
        }
      : null;
  },

  /**
   * Create a new user.
   * DB must enforce UNIQUE(email) to prevent duplicates.
   */
  async create(input: CreateUserInput): Promise<{ id: string; email: string; createdAt?: string }> {
    const created = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      id: created.id,
      email: created.email,
      createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : undefined,
    };
  },
};

export default userRepository;
