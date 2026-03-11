import { mapping } from "@/lib/constants/constants";

export async function GET(
  request: Request,
  { params }: { params: { region: string; gameName: string; tagLine: string } },
) {
  const { region, gameName, tagLine } = params;
  const normalizedRegion = (region || '').toUpperCase().trim();
  const mappedRegion = mapping[normalizedRegion] ?? normalizedRegion;
  const name = encodeURIComponent(gameName);
  const tag = encodeURIComponent(tagLine);

  const url = `https://${mappedRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`;

  const key = process.env.RIOT_API_KEY;

  if (!key)
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
    });

  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": key,
    },
  });

  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
