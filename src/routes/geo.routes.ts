import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { geoSelfController, geoByIpController } from "../controllers/geo.controller";

const router = Router();

/**
 * GET /api/geo/self
 * Protected
 * Returns geolocation info for the current request
 */
router.get("/geo/self", authMiddleware, geoSelfController);
router.get("/geo/:ip", authMiddleware, geoByIpController);

export default router;
