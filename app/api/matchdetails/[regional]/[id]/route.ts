import { mapping } from "@/lib/constants/constants";
import { fetchRiotJson } from "@/lib/riot/fetchRiotJson";
import { RiotMatchSchema } from "@/lib/types/riotTypes";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ regional: string; id: string }> },
) {
  const { regional, id } = await params;

  const normalizedRegion = (regional || "").toUpperCase().trim();
    const mappedRegion =
    mapping[normalizedRegion]?.regional ?? normalizedRegion.toLowerCase();

  const encodedId = encodeURIComponent(id);

  const url = `https://${mappedRegion}.api.riotgames.com/lol/match/v5/matches/${encodedId}`;

  return fetchRiotJson(url, RiotMatchSchema);
}
