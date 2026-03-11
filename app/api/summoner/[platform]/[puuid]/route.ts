import { mapping } from "@/lib/constants/constants";
import { fetchRiotJson } from "@/lib/riot/fetchRiotJson";
import { RiotSummonerSchema } from "@/lib/types/riotTypes";

export async function GET(
  _request: Request,
  { params }: { params: { platform: string; puuid: string } },
) {
  const { platform, puuid } = params;

  const normalizedPlatform = (platform || "").toUpperCase().trim();
  const mappedPlatform =
    mapping[normalizedPlatform]?.platform ?? normalizedPlatform.toLowerCase();

  const encodedPuuid = encodeURIComponent(puuid);

  const url = `https://${mappedPlatform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodedPuuid}`;

  return fetchRiotJson(url, RiotSummonerSchema);
}
