import { buildCacheKey, getAnalysisCacheTtlSeconds, getCachedJson, setCachedJson } from "@/lib/cache/redis";
import { mapping } from "@/lib/constants/constants";
import { RiotApiError, fetchRiotData } from "@/lib/riot/fetchRiotJson";
import {
  RiotAccountSchema,
  RiotMatchIdsSchema,
  RiotMatchSchema,
  RiotMasterySchema,
  RiotRankedStatSchema,
  RiotSummonerSchema,
  type RiotMatch,
  type RiotMasteryEntry,
  type RiotRankedEntry,
} from "@/lib/types/riotTypes";
import { z } from "zod";

const MAX_MATCHES_TO_ANALYZE = 50;
const MATCH_IDS_TO_FETCH = 100;
const MAX_MATCH_HISTORY_PAGES = 5;
const SECONDARY_ROLE_MIN_GAMES = 8;
const CLEAR_MAIN_ROLE_SHARE = 0.6;
const HIGH_MASTERY_POINTS = 50000;
const ALL_SUPPORTED_ROLES: SupportedRole[] = ["TOP", "JUNGLE", "MIDDLE", "ADC", "SUPPORT"];
const SOLO_QUEUE_ID = 420;
const ANALYSIS_CACHE_KEY_VERSION = "v1";

const DDragonVersionsSchema = z.array(z.string()).min(1);
const ChampionCatalogSchema = z.object({
  data: z.record(
    z.string(),
    z.object({
      key: z.string(),
      id: z.string(),
      name: z.string(),
      tags: z.array(z.string()),
    }),
  ),
});

type SupportedRole = "TOP" | "JUNGLE" | "MIDDLE" | "ADC" | "SUPPORT";

type ChampionSummary = {
  champion: string;
  assetId: string;
  plays: number;
  wins: number;
  losses: number;
  winRate: number;
  mastery: number;
  tags: string[];
};

type RecommendationType = "Main Pick" | "Safe Backup" | "Situational";

type Recommendation = {
  type: RecommendationType;
  champion: string;
  reason: string;
  tags: string[];
  stats: ChampionSummary;
};

type RoleAnalysis = {
  role: SupportedRole;
  count: number;
  share: number;
  recommendations: Recommendation[];
  recentChamps: ChampionSummary[];
};

type PlayerAnalysisResult = {
  player: {
    gameName: string;
    tagLine: string;
    profileIconId: number;
    puuid: string;
    summonerLevel: number;
    ranked: RiotRankedEntry | null;
  };
  analysis: {
    totalMatches: number;
    totalTrackedGames: number;
    unassignedMatches: number;
    mainRole: SupportedRole | null;
    mainRoleCount: number;
    mainRoleShare: number;
    mainRoleConfidence: "clear" | "mixed";
    secondaryRole: SupportedRole | null;
    secondaryRoleCount: number;
    roleCounts: Partial<Record<SupportedRole, number>>;
    roles: RoleAnalysis[];
    insights: string[];
  };
  ddragonVersion: string;
};

type ChampionCatalog = {
  version: string;
  champIdToAssetId: Record<number, string>;
  assetIdToDisplayName: Record<string, string>;
  assetIdToTags: Record<string, string[]>;
};

const emptyChampionCatalog: ChampionCatalog = {
  version: "latest",
  champIdToAssetId: {},
  assetIdToDisplayName: {},
  assetIdToTags: {},
};

let cachedChampionCatalog: ChampionCatalog | null = null;

function normalizeRole(role?: string | null): SupportedRole | null {
  const normalized = (role ?? "").toUpperCase().trim();

  if (!normalized || normalized === "NONE" || normalized === "UNKNOWN" || normalized === "INVALID") {
    return null;
  }

  if (normalized === "UTILITY") {
    return "SUPPORT";
  }

  if (normalized === "BOTTOM") {
    return "ADC";
  }

  if (normalized === "TOP" || normalized === "JUNGLE" || normalized === "MIDDLE" || normalized === "ADC" || normalized === "SUPPORT") {
    return normalized;
  }

  return null;
}

async function getChampionCatalog(): Promise<ChampionCatalog> {
  if (cachedChampionCatalog) {
    return cachedChampionCatalog;
  }

  const versionsResponse = await fetch("https://ddragon.leagueoflegends.com/api/versions.json", {
    next: { revalidate: 86400 },
  });

  if (!versionsResponse.ok) {
    throw new Error("Failed to fetch Data Dragon versions");
  }

  const versions = DDragonVersionsSchema.parse(await versionsResponse.json());
  const version = versions[0];
  const championResponse = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    {
      next: { revalidate: 86400 },
    },
  );

  if (!championResponse.ok) {
    throw new Error("Failed to fetch champion catalog");
  }

  const championCatalog = ChampionCatalogSchema.parse(await championResponse.json());
  const champIdToAssetId: Record<number, string> = {};
  const assetIdToDisplayName: Record<string, string> = {};
  const assetIdToTags: Record<string, string[]> = {};

  for (const champion of Object.values(championCatalog.data)) {
    champIdToAssetId[Number(champion.key)] = champion.id;
    assetIdToDisplayName[champion.id] = champion.name;
    assetIdToTags[champion.id] = champion.tags;
  }

  cachedChampionCatalog = {
    version,
    champIdToAssetId,
    assetIdToDisplayName,
    assetIdToTags,
  };

  return cachedChampionCatalog;
}

function formatWinRate(winRate: number): string {
  return `${Math.round(winRate * 100)}%`;
}

function formatMastery(points: number): string {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }

  return `${points}`;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function computeStableWinRate(champion: ChampionSummary): number {
  const baselineWins = 1.5;
  const baselineGames = 3;

  return (champion.wins + baselineWins) / (champion.plays + baselineGames);
}

function getSampleConfidence(champion: ChampionSummary): number {
  return clamp(champion.plays / 4);
}

function getBadFormPenalty(champion: ChampionSummary): number {
  if (champion.plays < 4 || champion.winRate >= 0.4) {
    return 0;
  }

  return (0.4 - champion.winRate) * 1.4;
}

function getLowSamplePenalty(champion: ChampionSummary): number {
  if (champion.plays >= 4) {
    return 0;
  }

  return (1 - getSampleConfidence(champion)) * 0.28;
}

function getTagDiversityScore(champion: ChampionSummary, selectedChampions: ChampionSummary[]): number {
  if (selectedChampions.length === 0 || champion.tags.length === 0) {
    return 1;
  }

  const selectedTags = new Set(selectedChampions.flatMap((selectedChampion) => selectedChampion.tags));
  const newTags = champion.tags.filter((tag) => !selectedTags.has(tag)).length;

  return newTags / champion.tags.length;
}

function buildChampionScoreContext(champions: ChampionSummary[]) {
  const maxPlays = Math.max(...champions.map((champion) => champion.plays), 1);
  const maxMastery = Math.max(...champions.map((champion) => champion.mastery), 1);

  return { maxPlays, maxMastery };
}

function scoreMainPick(champion: ChampionSummary, context: { maxPlays: number; maxMastery: number }): number {
  const recentPresence = champion.plays / context.maxPlays;
  const stableWinRate = computeStableWinRate(champion);
  const masteryDepth = champion.mastery / context.maxMastery;
  const sampleConfidence = getSampleConfidence(champion);
  const badFormPenalty = getBadFormPenalty(champion);

  return recentPresence * 0.28 + stableWinRate * 0.37 + masteryDepth * 0.2 + sampleConfidence * 0.15 - badFormPenalty;
}

function scoreSafePick(champion: ChampionSummary, context: { maxPlays: number; maxMastery: number }): number {
  const stableWinRate = computeStableWinRate(champion);
  const masteryDepth = champion.mastery / context.maxMastery;
  const recentPresence = champion.plays / context.maxPlays;
  const sampleConfidence = getSampleConfidence(champion);
  const safetyProfile = champion.tags.includes("Tank") || champion.tags.includes("Support") ? 1 : 0;
  const badFormPenalty = getBadFormPenalty(champion);
  const lowSamplePenalty = getLowSamplePenalty(champion);

  return (
    safetyProfile * 0.32 +
    masteryDepth * 0.18 +
    stableWinRate * 0.24 +
    recentPresence * 0.08 +
    sampleConfidence * 0.18 -
    badFormPenalty -
    lowSamplePenalty
  );
}

function scoreSituationalPick(
  champion: ChampionSummary,
  context: { maxPlays: number; maxMastery: number },
  selectedChampions: ChampionSummary[],
): number {
  const stableWinRate = computeStableWinRate(champion);
  const masteryDepth = champion.mastery / context.maxMastery;
  const recentPresence = champion.plays / context.maxPlays;
  const sampleConfidence = getSampleConfidence(champion);
  const tagDiversity = getTagDiversityScore(champion, selectedChampions);
  const alreadySelected = selectedChampions.some((selectedChampion) => selectedChampion.champion === champion.champion);
  const profileVariance = champion.tags.includes("Mage") || champion.tags.includes("Marksman") || champion.tags.includes("Assassin") ? 1 : 0.45;
  const badFormPenalty = getBadFormPenalty(champion);
  const lowSamplePenalty = getLowSamplePenalty(champion);

  return (
    profileVariance * 0.18 +
    tagDiversity * 0.3 +
    masteryDepth * 0.16 +
    stableWinRate * 0.2 +
    recentPresence * 0.04 +
    sampleConfidence * 0.12 -
    badFormPenalty -
    lowSamplePenalty -
    (alreadySelected ? 1 : 0)
  );
}

function selectBestChampion(
  champions: ChampionSummary[],
  score: (champion: ChampionSummary) => number,
): ChampionSummary | null {
  const ranked = [...champions].sort((left, right) => score(right) - score(left));

  return ranked[0] ?? null;
}

function describeMainPick(champion: ChampionSummary): string {
  const reasons: string[] = [];

  if (champion.plays >= 4) {
    reasons.push(`${champion.plays} recent games`);
  }

  if (champion.winRate >= 0.5) {
    reasons.push(`${formatWinRate(champion.winRate)} recent win rate`);
  }

  if (champion.mastery >= HIGH_MASTERY_POINTS) {
    reasons.push(`${formatMastery(champion.mastery)} mastery`);
  }

  return reasons.length > 0
    ? `Best overall fit from your recent form and comfort: ${reasons.join(", ")}.`
    : "Best overall fit from the mix of recent form, mastery, and reliability.";
}

function describeSafePick(champion: ChampionSummary): string {
  if (champion.tags.includes("Tank") || champion.tags.includes("Support")) {
    return `Safer profile for consistent games, backed by ${formatMastery(champion.mastery)} mastery and ${formatWinRate(champion.winRate)} recent win rate.`;
  }

  return `Reliable fallback based on comfort and stable results: ${champion.plays} recent games with ${formatWinRate(champion.winRate)} win rate.`;
}

function describeSituationalPick(champion: ChampionSummary): string {
  if (champion.mastery >= HIGH_MASTERY_POINTS) {
    return `Pocket option with ${formatMastery(champion.mastery)} mastery when you want a different look in draft.`;
  }

  return "Useful alternative when your first two picks are banned or the matchup needs a different profile.";
}

function buildRecommendations(champions: ChampionSummary[]): Recommendation[] {
  if (champions.length === 0) {
    return [];
  }

  const recommendations: Recommendation[] = [];
  const scoreContext = buildChampionScoreContext(champions);
  const mainPick = selectBestChampion(champions, (champion) => scoreMainPick(champion, scoreContext));

  if (!mainPick) {
    return [];
  }

  const rest = champions.filter((champion) => champion.champion !== mainPick.champion);

  recommendations.push({
    type: "Main Pick",
    champion: mainPick.champion,
    reason: describeMainPick(mainPick),
    tags: mainPick.tags,
    stats: mainPick,
  });

  const safeBackup = selectBestChampion(rest, (champion) => scoreSafePick(champion, scoreContext));

  if (safeBackup) {
    recommendations.push({
      type: "Safe Backup",
      champion: safeBackup.champion,
      reason: describeSafePick(safeBackup),
      tags: safeBackup.tags,
      stats: safeBackup,
    });
  }

  const selectedChampions = [mainPick, safeBackup].filter(
    (champion): champion is ChampionSummary => Boolean(champion),
  );
  const alreadySelected = new Set<string>(selectedChampions.map((champion) => champion.champion));
  const situationalPool = champions.filter((champion) => !alreadySelected.has(champion.champion));
  const situational = selectBestChampion(situationalPool, (champion) =>
    scoreSituationalPick(champion, scoreContext, selectedChampions),
  );

  if (situational) {
    recommendations.push({
      type: "Situational",
      champion: situational.champion,
      reason: describeSituationalPick(situational),
      tags: situational.tags,
      stats: situational,
    });
  }

  return recommendations;
}

function buildInsights(championPool: ChampionSummary[], mainRoleShare: number): string[] {
  if (championPool.length === 0) {
    return [];
  }

  const totalGames = championPool.reduce((sum, champion) => sum + champion.plays, 0);
  const topThreeShare = championPool.slice(0, 3).reduce((sum, champion) => sum + champion.plays, 0) / totalGames;
  const topChampion = championPool[0];
  const insights: string[] = [];

  if (mainRoleShare >= CLEAR_MAIN_ROLE_SHARE) {
    insights.push(`Clear main role signal from the last ${totalGames} tracked games.`);
  }

  if (topThreeShare >= 0.75) {
    insights.push("Low champion spread recently, which makes the pool recommendation more stable.");
  }

  if (topChampion.winRate >= 0.55 && topChampion.plays >= 4) {
    insights.push(`${topChampion.champion} is showing strong recent form at ${formatWinRate(topChampion.winRate)}.`);
  }

  if (topChampion.mastery >= HIGH_MASTERY_POINTS) {
    insights.push(`${topChampion.champion} also has deep mastery at ${formatMastery(topChampion.mastery)} points.`);
  }

  return insights;
}

function friendlyError(error: unknown): Error {
  if (error instanceof RiotApiError) {
    if (error.status === 404) {
      return new Error("Player not found for that Riot ID or region.");
    }

    if (error.status === 429) {
      return new Error("Riot API is rate limiting requests right now. Try again in a moment.");
    }

    if (
      typeof error.body === "object" &&
      error.body !== null &&
      "error" in error.body &&
      typeof (error.body as { error?: unknown }).error === "string"
    ) {
      return new Error((error.body as { error: string }).error);
    }

    return new Error(error.message);
  }

  return error instanceof Error ? error : new Error("Failed to analyze player.");
}

function normalizeCacheSegment(value: string): string {
  return encodeURIComponent(value.trim().toLowerCase());
}

function getAnalysisCacheKey(input: { region: string; gameName: string; tagLine: string }): string {
  return buildCacheKey(
    "analysis",
    ANALYSIS_CACHE_KEY_VERSION,
    normalizeCacheSegment(input.region),
    normalizeCacheSegment(input.gameName),
    normalizeCacheSegment(input.tagLine),
  );
}

async function fetchRecentSoloQueueMatches(regionalHost: string, encodedPuuid: string): Promise<RiotMatch[]> {
  const soloQueueMatches: RiotMatch[] = [];

  for (let pageIndex = 0; pageIndex < MAX_MATCH_HISTORY_PAGES; pageIndex += 1) {
    const start = pageIndex * MATCH_IDS_TO_FETCH;
    const matchIdsUrl =
      `https://${regionalHost}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodedPuuid}/ids` +
      `?start=${start}&count=${MATCH_IDS_TO_FETCH}&type=ranked`;
    const matchIds = await fetchRiotData(matchIdsUrl, RiotMatchIdsSchema);

    if (matchIds.length === 0) {
      break;
    }

    const matchDetailResults = await Promise.allSettled(
      matchIds.map((matchId) =>
        fetchRiotData(
          `https://${regionalHost}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`,
          RiotMatchSchema,
        ),
      ),
    );

    for (const result of matchDetailResults) {
      if (result.status !== "fulfilled") {
        continue;
      }

      if (result.value.info.queueId !== SOLO_QUEUE_ID) {
        continue;
      }

      soloQueueMatches.push(result.value);

      if (soloQueueMatches.length >= MAX_MATCHES_TO_ANALYZE) {
        return soloQueueMatches;
      }
    }

    if (matchIds.length < MATCH_IDS_TO_FETCH) {
      break;
    }
  }

  return soloQueueMatches;
}

async function analyzePlayerUncached(input: {
  region: string;
  gameName: string;
  tagLine: string;
}): Promise<PlayerAnalysisResult> {
  try {
    const normalizedRegion = input.region.toUpperCase().trim();
    const mappedRegion = mapping[normalizedRegion];

    if (!mappedRegion) {
      throw new Error("Unsupported region. Use one of the configured platform keys.");
    }

    const encodedGameName = encodeURIComponent(input.gameName);
    const encodedTagLine = encodeURIComponent(input.tagLine);
    const accountUrl = `https://${mappedRegion.regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;
    const account = await fetchRiotData(accountUrl, RiotAccountSchema);
    const puuid = account.puuid;
    const encodedPuuid = encodeURIComponent(puuid);

    const summonerUrl = `https://${mappedRegion.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodedPuuid}`;
    const masteryUrl = `https://${mappedRegion.platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodedPuuid}`;
    const rankedUrl = `https://${mappedRegion.platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodedPuuid}`;

    const [summoner, masteryResult, rankedResult, matchDetails, championCatalog] = await Promise.all([
      fetchRiotData(summonerUrl, RiotSummonerSchema),
      fetchRiotData(masteryUrl, RiotMasterySchema).catch(() => [] as RiotMasteryEntry[]),
      fetchRiotData(rankedUrl, RiotRankedStatSchema).catch(() => [] as RiotRankedEntry[]),
      fetchRecentSoloQueueMatches(mappedRegion.regional, encodedPuuid),
      getChampionCatalog().catch(() => emptyChampionCatalog),
    ]);

    if (matchDetails.length === 0) {
      throw new Error("No recent solo queue ranked matches were available to analyze.");
    }

    const masteryMap = new Map<string, RiotMasteryEntry>();
    for (const mastery of masteryResult) {
      const assetId = championCatalog.champIdToAssetId[mastery.championId];
      if (assetId) {
        masteryMap.set(assetId, mastery);
      }
    }

    const roleCounts: Partial<Record<SupportedRole, number>> = {};
    const championStatsByRole = new Map<
      SupportedRole,
      Map<string, { plays: number; wins: number; displayName: string }>
    >();

    for (const match of matchDetails) {
      const participant = match.info.participants.find((entry) => entry.puuid === puuid);

      if (!participant) {
        continue;
      }

      const role = normalizeRole(participant.teamPosition ?? participant.individualPosition);

      if (!role) {
        continue;
      }

      const roleChampionStats =
        championStatsByRole.get(role) ?? new Map<string, { plays: number; wins: number; displayName: string }>();
      const assetId =
        (participant.championId ? championCatalog.champIdToAssetId[participant.championId] : undefined) ??
        participant.championName;
      const displayName = championCatalog.assetIdToDisplayName[assetId] ?? participant.championName;
      const championStats = roleChampionStats.get(assetId) ?? { plays: 0, wins: 0, displayName };

      roleCounts[role] = (roleCounts[role] ?? 0) + 1;
      championStats.plays += 1;
      if (participant.win) {
        championStats.wins += 1;
      }

      roleChampionStats.set(assetId, championStats);
      championStatsByRole.set(role, roleChampionStats);
    }

    const sortedRoles = (Object.entries(roleCounts) as Array<[SupportedRole, number]>).sort((left, right) => right[1] - left[1]);
    const mainRole = sortedRoles[0]?.[0] ?? null;
    const mainRoleCount = sortedRoles[0]?.[1] ?? 0;
    const totalTrackedGames = matchDetails.length;
    const unassignedMatches = 0;
    const mainRoleShare = totalTrackedGames > 0 ? mainRoleCount / totalTrackedGames : 0;
    const secondaryRole = sortedRoles[1] && sortedRoles[1][1] >= SECONDARY_ROLE_MIN_GAMES ? sortedRoles[1][0] : null;
    const secondaryRoleCount = secondaryRole ? (roleCounts[secondaryRole] ?? 0) : 0;
    const rankedSolo = rankedResult.find((entry) => entry.queueType === "RANKED_SOLO_5x5") ?? null;

    const rolesToShow = ALL_SUPPORTED_ROLES.map((role) => {
        const count = roleCounts[role] ?? 0;
        const roleChampionStats =
          championStatsByRole.get(role) ?? new Map<string, { plays: number; wins: number; displayName: string }>();
        const recentChamps = [...roleChampionStats.entries()]
          .map(([assetId, stats]) => {
            const mastery = masteryMap.get(assetId)?.championPoints ?? 0;
            const tags = championCatalog.assetIdToTags[assetId] ?? [];

            return {
              champion: stats.displayName,
              assetId,
              plays: stats.plays,
              wins: stats.wins,
              losses: stats.plays - stats.wins,
              winRate: stats.plays > 0 ? stats.wins / stats.plays : 0,
              mastery,
              tags,
            };
          })
          .sort((left, right) => right.plays - left.plays || right.winRate - left.winRate || right.mastery - left.mastery);

        return {
          role,
          count,
          share: totalTrackedGames > 0 ? count / totalTrackedGames : 0,
          recommendations: buildRecommendations(recentChamps),
          recentChamps,
        };
      }).sort((left, right) => {
        if (left.count === 0 && right.count > 0) {
          return 1;
        }

        if (left.count > 0 && right.count === 0) {
          return -1;
        }

        return right.count - left.count;
      });

    const mainRoleAnalysis = rolesToShow.find((roleAnalysis) => roleAnalysis.role === mainRole) ?? null;
    const insights = mainRoleAnalysis ? buildInsights(mainRoleAnalysis.recentChamps, mainRoleShare) : [];

    return {
      player: {
        gameName: account.gameName ?? input.gameName,
        tagLine: account.tagLine ?? input.tagLine,
        profileIconId: summoner.profileIconId,
        puuid,
        summonerLevel: summoner.summonerLevel,
        ranked: rankedSolo,
      },
      analysis: {
        totalMatches: matchDetails.length,
        totalTrackedGames,
        unassignedMatches,
        mainRole,
        mainRoleCount,
        mainRoleShare,
        mainRoleConfidence: mainRoleShare >= CLEAR_MAIN_ROLE_SHARE ? "clear" : "mixed",
        secondaryRole,
        secondaryRoleCount,
        roleCounts,
        roles: rolesToShow,
        insights,
      },
      ddragonVersion: championCatalog.version,
    };
  } catch (error) {
    throw friendlyError(error);
  }
}

export async function analyzePlayer(input: {
  region: string;
  gameName: string;
  tagLine: string;
}): Promise<PlayerAnalysisResult> {
  const cacheKey = getAnalysisCacheKey(input);
  const cachedResult = await getCachedJson<PlayerAnalysisResult>(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const result = await analyzePlayerUncached(input);
  await setCachedJson(cacheKey, result, getAnalysisCacheTtlSeconds());

  return result;
}

export type { ChampionSummary, PlayerAnalysisResult, Recommendation, RoleAnalysis };