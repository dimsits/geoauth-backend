import type { Request } from "express";

/**
 * Normalize an IP string to a clean IPv4/IPv6 value.
 * - Trims whitespace
 * - Removes surrounding brackets (e.g. "[::1]")
 * - Removes port suffix for IPv4 (e.g. "1.2.3.4:1234")
 * - Converts IPv6-mapped IPv4 ("::ffff:1.2.3.4") to "1.2.3.4"
 * Returns null if the input is empty/unusable.
 */
export function normalizeIp(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  let ip = raw.trim();
  if (!ip) return null;

  // Remove brackets: "[::1]" -> "::1"
  if (ip.startsWith("[") && ip.endsWith("]")) {
    ip = ip.slice(1, -1).trim();
  }

  // If it's IPv6-mapped IPv4: "::ffff:127.0.0.1" -> "127.0.0.1"
  // (Case-insensitive to be safe.)
  const lower = ip.toLowerCase();
  if (lower.startsWith("::ffff:")) {
    ip = ip.slice("::ffff:".length);
  }

  // Remove zone index for IPv6 link-local: "fe80::1%lo0" -> "fe80::1"
  const zoneIndex = ip.indexOf("%");
  if (zoneIndex !== -1) {
    ip = ip.slice(0, zoneIndex);
  }

  // Remove port for IPv4: "1.2.3.4:1234" -> "1.2.3.4"
  // Do NOT remove for IPv6 because ":" is part of the address.
  if (ip.includes(".") && ip.includes(":")) {
    const lastColon = ip.lastIndexOf(":");
    const maybePort = ip.slice(lastColon + 1);
    if (/^\d+$/.test(maybePort)) {
      ip = ip.slice(0, lastColon);
    }
  }

  ip = ip.trim();
  return ip || null;
}

/**
 * Extract client IP from an Express request.
 * Priority:
 * 1) x-forwarded-for (first IP)
 * 2) x-real-ip
 * 3) req.ip
 * 4) req.socket.remoteAddress
 *
 * Note: If you deploy behind a proxy, ensure Express 'trust proxy'
 * is configured appropriately; x-forwarded-for is still handled here.
 */
export function getClientIp(req: Request): string | null {
  // 1) x-forwarded-for can contain a list: "client, proxy1, proxy2"
  const xff = req.header("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    const normalized = normalizeIp(first);
    if (normalized) return normalized;
  }

  // 2) x-real-ip (some proxies set this)
  const xRealIp = req.header("x-real-ip");
  if (xRealIp) {
    const normalized = normalizeIp(xRealIp);
    if (normalized) return normalized;
  }

  // 3) Express computed IP
  // (May reflect proxy settings if 'trust proxy' is enabled.)
  const expressIp = normalizeIp(req.ip);
  if (expressIp) return expressIp;

  // 4) Socket remote address
  const sockIp = normalizeIp(req.socket?.remoteAddress);
  if (sockIp) return sockIp;

  return null;
}

/**
 * Optional helper: basic private/local IP detection.
 * Useful if you want to skip ipinfo calls for private addresses in prod.
 */
export function isPrivateIp(ip: string): boolean {
  const v = ip.trim().toLowerCase();

  // Localhost
  if (v === "127.0.0.1" || v === "::1") return true;

  // IPv4 private ranges
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;

  // 172.16.0.0 – 172.31.255.255
  if (v.startsWith("172.")) {
    const parts = v.split(".");
    const second = Number(parts[1]);
    if (!Number.isNaN(second) && second >= 16 && second <= 31) return true;
  }

  // IPv4 link-local 169.254.0.0/16
  if (v.startsWith("169.254.")) return true;

  // IPv6 unique local addresses (fc00::/7) and link-local (fe80::/10)
  if (v.startsWith("fc") || v.startsWith("fd")) return true;
  if (v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb"))
    return true;

  return false;
}

export default {
  normalizeIp,
  getClientIp,
  isPrivateIp,
};
