import { mapping } from "@/lib/constants/constants";
import { fetchRiotJson } from "@/lib/riot/fetchRiotJson";
import { RiotRankedStatSchema } from "@/lib/types/riotTypes";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string; puuid: string }> },
) {
  const { platform, puuid } = await params;

  const normalizedPlatform = (platform || "").toUpperCase().trim();
  const mappedPlatform =
    mapping[normalizedPlatform]?.platform ?? normalizedPlatform.toLowerCase();

  const encodedPuuid = encodeURIComponent(puuid);

  const url = `https://${mappedPlatform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodedPuuid}`;

  return fetchRiotJson(url, RiotRankedStatSchema);
}
