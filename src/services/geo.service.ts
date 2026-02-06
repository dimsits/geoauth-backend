import { isPrivateIp } from "../utils/ip";
import ipinfoClient from "../lib/ipinfo";

/**
 * GeoSnapshot (aligned to IPInfo response format)
 * Stored as JSON later (history), but returned as a consistent shape here.
 */
export type GeoSnapshot = {
  ip: string;
  asn: string | null;
  as_name: string | null;
  as_domain: string | null;
  country_code: string | null;
  country: string | null;
  continent_code: string | null;
  continent: string | null;

  source: "ipinfo";
  resolvedAt: string; // ISO timestamp
};

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
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
    //   ip, asn, as_name, as_domain, country_code, country, continent_code, continent
    // }
    const raw = await ipinfoClient.lookup(ip);

    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;

    const geo: GeoSnapshot = {
      ip: asString(r.ip) ?? ip,
      asn: asString(r.asn),
      as_name: asString(r.as_name),
      as_domain: asString(r.as_domain),
      country_code: asString(r.country_code),
      country: asString(r.country),
      continent_code: asString(r.continent_code),
      continent: asString(r.continent),

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
