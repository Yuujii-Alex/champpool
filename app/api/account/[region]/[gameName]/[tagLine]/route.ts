import { mapping } from "@/lib/constants/constants";
import { RiotAccountSchema, type RiotAccount } from "@/lib/types/riotTypes";

export async function GET(
  request: Request,
  { params }: { params: { region: string; gameName: string; tagLine: string } },
) {
  const { region, gameName, tagLine } = params;
  const normalizedRegion = (region || '').toUpperCase().trim();
  const mappedRegion = mapping[normalizedRegion]?.regional ?? normalizedRegion.toLowerCase();
  const name = encodeURIComponent(gameName);
  const tag = encodeURIComponent(tagLine);

  const url = `https://${mappedRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`;

  const key = process.env.RIOT_API_KEY;

  if (!key)
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
    });

  // helper
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const maxRetries = 3;
  const baseDelay = 500; // ms

  let res: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      res = await fetch(url, { headers: { "X-Riot-Token": key } });
    } catch (err) {
      if (attempt === maxRetries) {
        return new Response(JSON.stringify({ error: "Network error contacting Riot API" }), { status: 502 });
      }
      await sleep(baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300));
      continue;
    }

    if (res.status === 429) {
      const ra = res.headers.get("retry-after");
      let waitMs = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300);

      if (ra) {
        const secs = Number(ra);
        if (!Number.isNaN(secs)) {
          waitMs = secs * 1000;
        } else {
          const date = Date.parse(ra);
          if (!Number.isNaN(date)) waitMs = Math.max(date - Date.now(), 0);
        }
      }

      if (attempt === maxRetries) break;
      await sleep(waitMs);
      continue;
    }

    if (res.status >= 500 && res.status < 600 && attempt < maxRetries) {
      await sleep(baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 300));
      continue;
    }

    break;
  }

  if (!res) {
    return new Response(JSON.stringify({ error: "No response from Riot API" }), { status: 502 });
  }

  const contentType = res.headers.get("content-type") ?? "application/json";
  const text = await res.text();

  if (contentType.includes("application/json")) {
    try {
      const json = await res.json();
      const parsed = RiotAccountSchema.safeParse(json);
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Invalid Riot response" }), { status: 502 });
      }
      const data: RiotAccount = parsed.data;
      return new Response(JSON.stringify(data), { status: res.status, headers: { "content-type": "application/json" } });
    } catch {
      return new Response(JSON.stringify({ error: "Error parsing Riot response" }), { status: 502 });
    }
  }

  return new Response(text, { status: res.status, headers: { "content-type": contentType } });
}
