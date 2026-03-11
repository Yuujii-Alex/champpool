import { z } from "zod";

export const RiotAccountSchema = z.object({
  puuid: z.string().length(78),
  gameName: z.string().max(16).optional(),
  tagLine: z.string().max(5).optional(),
});

export type RiotAccount = z.infer<typeof RiotAccountSchema>;

export const RiotSummonerSchema = z.object({
  accountId: z.string(),
  id: z.string(),
  puuid: z.string().length(78),
  profileIconId: z.number(),
  revisionDate: z.number(),
  summonerLevel: z.number(),
});

export type RiotSummoner = z.infer<typeof RiotSummonerSchema>;