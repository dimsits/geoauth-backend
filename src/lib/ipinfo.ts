const IPINFO_BASE_URL = "https://ipinfo.io";

function getToken(): string {
  const token = process.env.IPINFO_TOKEN;
  if (!token) {
    throw new Error("IPINFO_TOKEN is not set");
  }
  return token;
}

/**
 * Raw IPInfo client.
 * - Makes HTTP request to ipinfo.io
 * - Returns raw JSON payload
 * - Throws on non-OK responses
 */
async function lookup(ip: string): Promise<Record<string, unknown>> {
  const token = getToken();

  const url = `${IPINFO_BASE_URL}/${encodeURIComponent(ip)}?token=${token}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IPInfo request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  return data;
}

export const ipinfoClient = {
  lookup,
};

export default ipinfoClient;
