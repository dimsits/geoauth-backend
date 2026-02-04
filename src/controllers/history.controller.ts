import type { Request, Response, NextFunction } from "express";
import { assertIp } from "../utils/validate";
import { historyService } from "../services/history.service";

/**
 * POST /api/history/search
 * Protected
 * Body: { ip: string }
 * Creates a new search history entry and returns the resolved geo snapshot.
 */
export async function createSearchHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ip = assertIp((req.body as any)?.ip);
    const geo = await historyService.searchAndRecord({
      userId,
      ip,
    });

    return res.status(200).json({ geo });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/history
 * Protected
 * Returns the current user's search history (most recent first).
 */
export async function listSearchHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const limitRaw = req.query.limit;
    const limit =
      typeof limitRaw === "string" && !Number.isNaN(Number(limitRaw))
        ? Math.min(Number(limitRaw), 100)
        : undefined;

    const items = await historyService.listByUser({
      userId,
      limit,
    });

    return res.status(200).json({ items });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/history
 * Protected (Optional / Plus points)
 * Body: { ids: string[] }
 * Deletes multiple search history entries belonging to the current user.
 */
export async function deleteSearchHistoriesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ids = (req.body as any)?.ids;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      return res.status(400).json({ error: "Invalid ids", code: "VALIDATION_ERROR" });
    }

    const deleted = await historyService.deleteMany({
      userId,
      ids,
    });

    return res.status(200).json({ deleted });
  } catch (err) {
    return next(err);
  }
}

export default {
  createSearchHistoryController,
  listSearchHistoryController,
  deleteSearchHistoriesController,
};
