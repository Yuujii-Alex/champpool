import { mapping } from "@/lib/constants/constants";
import { fetchRiotJson } from "@/lib/riot/fetchRiotJson";
import { RiotMatchIdsSchema } from "@/lib/types/riotTypes";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ regional: string; puuid: string }> },
) {
  const { regional, puuid } = await params;

  const normalizedRegion = (regional || "").toUpperCase().trim();
    const mappedRegion =
    mapping[normalizedRegion]?.regional ?? normalizedRegion.toLowerCase();

  const encodedPuuid = encodeURIComponent(puuid);

  const url = `https://${mappedRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodedPuuid}/ids?start=0&count=100&type=ranked`;

  return fetchRiotJson(url, RiotMatchIdsSchema);
}
