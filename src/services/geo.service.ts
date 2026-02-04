import { isPrivateIp } from "../utils/ip";
import ipinfoClient from "../lib/ipinfo";

/**
 * GeoSnapshot (aligned to IPInfo response format)
 * Stored as JSON later (history), but returned as a consistent shape here.
 */
export type GeoSnapshot = {
  ip: string;

  network: string | null;

  city: string | null;
  region: string | null;
  regionCode: string | null;

  country: string | null;
  countryCode: string | null;

  continent: string | null;
  continentCode: string | null;

  latitude: number | null;
  longitude: number | null;

  timezone: string | null;
  postalCode: string | null;

  source: "ipinfo";
  resolvedAt: string; // ISO timestamp
};

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Resolve IP geolocation via IPInfo.
 * - Never throws: returns null on any failure.
 * - Skips private/local IPs.
 */
async function resolve(ip: string | null): Promise<GeoSnapshot | null> {
  try {
    if (!ip) return null;
    if (isPrivateIp(ip)) return null;

    // Expected IPInfo-ish payload example:
    // {
    //   network, city, region, region_code, country, country_code,
    //   continent, continent_code, latitude, longitude, timezone, postal_code
    // }
    const raw = await ipinfoClient.lookup(ip);

    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;

    const geo: GeoSnapshot = {
      ip,

      network: asString(r.network),

      city: asString(r.city),
      region: asString(r.region),
      regionCode: asString(r.region_code),

      country: asString(r.country),
      countryCode: asString(r.country_code),

      continent: asString(r.continent),
      continentCode: asString(r.continent_code),

      latitude: asNumber(r.latitude),
      longitude: asNumber(r.longitude),

      timezone: asString(r.timezone),
      postalCode: asString(r.postal_code),

      source: "ipinfo",
      resolvedAt: new Date().toISOString(),
    };

    return geo;
  } catch {
    return null;
  }
}

export const geoService = { resolve };

export default geoService;
