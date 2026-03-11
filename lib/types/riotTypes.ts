import { z } from "zod";

export const RiotAccountSchema = z.object({
  puuid: z.string().length(78),
  gameName: z.string().max(16).optional(),
  tagLine: z.string().max(5).optional(),
});

export type RiotAccount = z.infer<typeof RiotAccountSchema>;

export const RiotSummonerSchema = z.object({
  puuid: z.string().length(78),
  profileIconId: z.number(),
  revisionDate: z.number(),
  summonerLevel: z.number(),
});

export type RiotSummoner = z.infer<typeof RiotSummonerSchema>;

export const RiotRankedEntrySchema = z.object({
  queueType: z.string(),
  tier: z.string(),
  rank: z.string(),
  leaguePoints: z.number(),
  wins: z.number(),
  losses: z.number(),
});

export const RiotRankedStatSchema = z.array(RiotRankedEntrySchema);

export type RiotRankedEntry = z.infer<typeof RiotRankedEntrySchema>;
export type RiotRankedStats = z.infer<typeof RiotRankedStatSchema>;

export const RiotMasteryEntrySchema = z.object({
  championId: z.number(),
  championLevel: z.number(),
  championPoints: z.number(),
  lastPlayTime: z.number(),
});

export const RiotMasterySchema = z.array(RiotMasteryEntrySchema);

export type RiotMasteryEntry = z.infer<typeof RiotMasteryEntrySchema>;
export type RiotMasteries = z.infer<typeof RiotMasterySchema>;

export const RiotMatchIdsSchema = z.array(z.string());

export type RiotMatchIds = z.infer<typeof RiotMatchIdsSchema>;

export const RiotMatchParticipantSchema = z.object({
  puuid: z.string(),
  championName: z.string(),
  championId: z.number().optional(),
  teamPosition: z.string().optional(),
  individualPosition: z.string().optional(),
  win: z.boolean(),
});

export const RiotMatchSchema = z.object({
  metadata: z.object({
    matchId: z.string(),
  }),
  info: z.object({
    gameCreation: z.number().optional(),
    gameDuration: z.number().optional(),
    gameVersion: z.string().optional(),
    participants: z.array(RiotMatchParticipantSchema),
    queueId: z.number().optional(),
  }),
});

export type RiotMatchParticipant = z.infer<typeof RiotMatchParticipantSchema>;
export type RiotMatch = z.infer<typeof RiotMatchSchema>;