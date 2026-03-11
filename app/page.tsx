import HomeView from "@/components/home-view";
import { mapping } from "@/lib/constants/constants";
import {
  analyzePlayer,
  type PlayerAnalysisResult,
} from "@/lib/riot/analyzePlayer";

type HomeProps = {
  searchParams: Promise<{
    region?: string | string[];
    gameName?: string | string[];
    tagLine?: string | string[];
  }>;
};

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const region = readParam(params.region).toUpperCase();
  const gameName = readParam(params.gameName);
  const tagLine = readParam(params.tagLine);

  let result: PlayerAnalysisResult | null = null;
  let error: string | null = null;

  if (region && gameName && tagLine) {
    try {
      result = await analyzePlayer({ region, gameName, tagLine });
    } catch (analysisError) {
      error = analysisError instanceof Error ? analysisError.message : "Failed to analyze player.";
    }
  }

  const regionOptions = Object.keys(mapping).sort();

  return (
    <HomeView
      error={error}
      initialSearch={{
        region: region || "EUW",
        gameName,
        tagLine,
      }}
      regionOptions={regionOptions}
      result={result}
    />
  );
}
