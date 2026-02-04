import type { Request, Response, NextFunction } from "express";
import { getClientIp } from "../utils/ip";
import { assertIp } from "../utils/validate";
import { geoService } from "../services/geo.service";

/**
 * GET /api/geo/self
 * Protected
 * Returns geolocation info for the current request IP.
 */
export async function geoSelfController(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = getClientIp(req);
    const geo = await geoService.resolve(ip);
    return res.status(200).json({ geo });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/geo/:ip
 * Protected
 * Returns geolocation info for a provided IP address.
 */
export async function geoByIpController(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = assertIp(req.params.ip);
    const geo = await geoService.resolve(ip);
    return res.status(200).json({ geo });
  } catch (err) {
    return next(err);
  }
}

export default {
  geoSelfController,
  geoByIpController,
};
