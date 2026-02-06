const IPINFO_BASE_URL = "https://api.ipinfo.io";

function getToken(): string {
  const token = process.env.IPINFO_TOKEN;
  if (!token) {
    throw new Error("IPINFO_TOKEN is not set");
  }
  return token;
}

/**
 * Raw IPInfo client (Lite API).
 * - Calls: https://api.ipinfo.io/lite/<ip>?token=...
 */
async function lookup(ip: string): Promise<Record<string, unknown>> {
  const token = getToken();

  const url = `${IPINFO_BASE_URL}/lite/${encodeURIComponent(ip)}?token=${token}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IPInfo request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as Record<string, unknown>;
}

export const ipinfoClient = { lookup };
export default ipinfoClient;
