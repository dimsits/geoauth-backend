// src/controllers/auth.controller.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { parseAuthBody } from "../utils/validate";
import { authService } from "../services/auth.service";

/**
 * POST /api/login
 * Body: { email, password }
 * Response: { token }
 */
export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = parseAuthBody(req.body);
    const token = await authService.login({ email, password });
    return res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/register
 * Body: { email, password }
 * Response: { token } (if service returns token) OR { ok: true }
 */
export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = parseAuthBody(req.body);

    // If your service returns a token, return it; otherwise return ok:true
    const result = await authService.register({ email, password });

    if (typeof result === "string") {
      return res.status(201).json({ token: result });
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/me
 * Protected by authMiddleware (req.user is attached there)
 * Response: { user: { id, email?, createdAt? } }
 */
export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const user = await authService.me(userId);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        ...(user.createdAt ? { createdAt: user.createdAt } : {}),
      },
    });
  } catch (err) {
    return next(err);
  }
}
