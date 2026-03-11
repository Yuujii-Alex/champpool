import { mapping } from "@/lib/constants/constants";
import { fetchRiotJson } from "@/lib/riot/fetchRiotJson";
import { RiotAccountSchema } from "@/lib/types/riotTypes";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ region: string; gameName: string; tagLine: string }> },
) {
  const { region, gameName, tagLine } = await params;

  const normalizedRegion = (region || "").toUpperCase().trim();
  const mappedRegion =
    mapping[normalizedRegion]?.regional ?? normalizedRegion.toLowerCase();

  const name = encodeURIComponent(gameName);
  const tag = encodeURIComponent(tagLine);

  const url = `https://${mappedRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`;

  return fetchRiotJson(url, RiotAccountSchema);
}
