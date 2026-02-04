import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listSearchHistoryController,
  createSearchHistoryController,
  deleteSearchHistoriesController,
} from "../controllers/history.controller";

const router = Router();

/**
 * GET /api/history
 * Protected
 * Returns the current user's search history (most recent first).
 */
router.get("/", authMiddleware, listSearchHistoryController);

/**
 * POST /api/history/search
 * Protected
 * Body: { ip: string }
 * Creates a new search history entry and returns the resolved geo snapshot.
 */
router.post("/search", authMiddleware, createSearchHistoryController);

/**
 * DELETE /api/history
 * Protected (Optional / Plus points)
 * Body: { ids: string[] }
 * Deletes multiple history entries by ID (must belong to current user).
 */
router.delete("/", authMiddleware, deleteSearchHistoriesController);

export default router;
