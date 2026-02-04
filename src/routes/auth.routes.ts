import { Router } from "express";
import {
  loginController,
  registerController,
  meController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * POST /api/login
 * Public
 */
router.post("/login", loginController);

/**
 * POST /api/register
 * Public
 */
router.post("/register", registerController);

/**
 * GET /api/me
 * Protected
 */
router.get("/me", authMiddleware, meController);

export default router;
