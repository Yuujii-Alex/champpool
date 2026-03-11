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

export const RiotRankedStatSchema = z.object({
    "leagueId": z.string(),
    "queueType": z.string(),
    "tier": z.string(),
    "rank": z.string(),
    "puuid": z.string(),
    "leaguePoints": z.number(),
    "wins": z.number(),
    "losses": z.number(),
    "veteran": z.boolean(),
    "inactive": z.boolean(),
    "freshBlood": z.boolean(),
    "hotStreak": z.boolean(),
});
export type RiotRankedStat = z.infer<typeof RiotRankedStatSchema>;


export const RequireGradeCountsSchema = z.object({
    "A-": z.number(),
});
export type RequireGradeCounts = z.infer<typeof RequireGradeCountsSchema>;

export const NextSeasonMilestoneSchema = z.object({
    "requireGradeCounts": RequireGradeCountsSchema,
    "rewardMarks": z.number(),
    "bonus": z.boolean(),
    "totalGamesRequires": z.number(),
});
export type NextSeasonMilestone = z.infer<typeof NextSeasonMilestoneSchema>;

export const RiotMasterySchema = z.object({
    "puuid": z.string(),
    "championId": z.number(),
    "championLevel": z.number(),
    "championPoints": z.number(),
    "lastPlayTime": z.number(),
    "championPointsSinceLastLevel": z.number(),
    "championPointsUntilNextLevel": z.number(),
    "markRequiredForNextLevel": z.number(),
    "tokensEarned": z.number(),
    "championSeasonMilestone": z.number(),
    "nextSeasonMilestone": NextSeasonMilestoneSchema,
});
export type RiotMastery = z.infer<typeof RiotMasterySchema>;

export const RiotMatchIdsSchema = z.array(z.string());
export type RiotMatchIds = z.infer<typeof RiotMatchIdsSchema>;


// Riot full match details schema

export const LaneSchema = z.enum([
    "BOTTOM",
    "JUNGLE",
    "MIDDLE",
]);
export type Lane = z.infer<typeof LaneSchema>;


export const DescriptionSchema = z.enum([
    "primaryStyle",
    "subStyle",
]);
export type Description = z.infer<typeof DescriptionSchema>;

export const ChallengesSchema = z.object({
    "12AssistStreakCount": z.number(),
    "HealFromMapSources": z.number(),
    "InfernalScalePickup": z.number(),
    "SWARM_DefeatAatrox": z.number(),
    "SWARM_DefeatBriar": z.number(),
    "SWARM_DefeatMiniBosses": z.number(),
    "SWARM_EvolveWeapon": z.number(),
    "SWARM_Have3Passives": z.number(),
    "SWARM_KillEnemy": z.number(),
    "SWARM_PickupGold": z.number(),
    "SWARM_ReachLevel50": z.number(),
    "SWARM_Survive15Min": z.number(),
    "SWARM_WinWith5EvolvedWeapons": z.number(),
    "abilityUses": z.number(),
    "acesBefore15Minutes": z.number(),
    "alliedJungleMonsterKills": z.number(),
    "baronBuffGoldAdvantageOverThreshold": z.number().optional(),
    "baronTakedowns": z.number(),
    "blastConeOppositeOpponentCount": z.number(),
    "bountyGold": z.number(),
    "buffsStolen": z.number(),
    "completeSupportQuestInTime": z.number(),
    "controlWardsPlaced": z.number(),
    "damagePerMinute": z.number(),
    "damageTakenOnTeamPercentage": z.number(),
    "dancedWithRiftHerald": z.number(),
    "deathsByEnemyChamps": z.number(),
    "dodgeSkillShotsSmallWindow": z.number(),
    "doubleAces": z.number(),
    "dragonTakedowns": z.number(),
    "earliestBaron": z.number().optional(),
    "earliestDragonTakedown": z.number().optional(),
    "earlyLaningPhaseGoldExpAdvantage": z.number(),
    "effectiveHealAndShielding": z.number(),
    "elderDragonKillsWithOpposingSoul": z.number(),
    "elderDragonMultikills": z.number(),
    "enemyChampionImmobilizations": z.number(),
    "enemyJungleMonsterKills": z.number(),
    "epicMonsterKillsNearEnemyJungler": z.number(),
    "epicMonsterKillsWithin30SecondsOfSpawn": z.number(),
    "epicMonsterSteals": z.number(),
    "epicMonsterStolenWithoutSmite": z.number(),
    "fastestLegendary": z.number().optional(),
    "firstTurretKilled": z.number(),
    "firstTurretKilledTime": z.number().optional(),
    "fistBumpParticipation": z.number(),
    "flawlessAces": z.number(),
    "fullTeamTakedown": z.number(),
    "gameLength": z.number(),
    "getTakedownsInAllLanesEarlyJungleAsLaner": z.number().optional(),
    "goldPerMinute": z.number(),
    "hadOpenNexus": z.number(),
    "immobilizeAndKillWithAlly": z.number(),
    "initialBuffCount": z.number(),
    "initialCrabCount": z.number(),
    "jungleCsBefore10Minutes": z.number(),
    "junglerTakedownsNearDamagedEpicMonster": z.number(),
    "kTurretsDestroyedBeforePlatesFall": z.number(),
    "kda": z.number(),
    "killAfterHiddenWithAlly": z.number(),
    "killParticipation": z.number(),
    "killedChampTookFullTeamDamageSurvived": z.number(),
    "killingSprees": z.number(),
    "killsNearEnemyTurret": z.number(),
    "killsOnOtherLanesEarlyJungleAsLaner": z.number().optional(),
    "killsOnRecentlyHealedByAramPack": z.number(),
    "killsUnderOwnTurret": z.number(),
    "killsWithHelpFromEpicMonster": z.number(),
    "knockEnemyIntoTeamAndKill": z.number(),
    "landSkillShotsEarlyGame": z.number(),
    "laneMinionsFirst10Minutes": z.number(),
    "laningPhaseGoldExpAdvantage": z.number(),
    "legendaryCount": z.number(),
    "legendaryItemUsed": z.array(z.number()),
    "lostAnInhibitor": z.number(),
    "maxCsAdvantageOnLaneOpponent": z.number(),
    "maxKillDeficit": z.number(),
    "maxLevelLeadLaneOpponent": z.number(),
    "mejaisFullStackInTime": z.number(),
    "moreEnemyJungleThanOpponent": z.number(),
    "multiKillOneSpell": z.number(),
    "multiTurretRiftHeraldCount": z.number(),
    "multikills": z.number(),
    "multikillsAfterAggressiveFlash": z.number(),
    "outerTurretExecutesBefore10Minutes": z.number(),
    "outnumberedKills": z.number(),
    "outnumberedNexusKill": z.number(),
    "perfectDragonSoulsTaken": z.number(),
    "perfectGame": z.number(),
    "pickKillWithAlly": z.number(),
    "playedChampSelectPosition": z.number(),
    "poroExplosions": z.number(),
    "quickCleanse": z.number(),
    "quickFirstTurret": z.number(),
    "quickSoloKills": z.number(),
    "riftHeraldTakedowns": z.number(),
    "saveAllyFromDeath": z.number(),
    "scuttleCrabKills": z.number(),
    "skillshotsDodged": z.number(),
    "skillshotsHit": z.number(),
    "snowballsHit": z.number(),
    "soloBaronKills": z.number(),
    "soloKills": z.number(),
    "soloTurretsLategame": z.number().optional(),
    "stealthWardsPlaced": z.number(),
    "survivedSingleDigitHpCount": z.number(),
    "survivedThreeImmobilizesInFight": z.number(),
    "takedownOnFirstTurret": z.number(),
    "takedowns": z.number(),
    "takedownsAfterGainingLevelAdvantage": z.number(),
    "takedownsBeforeJungleMinionSpawn": z.number(),
    "takedownsFirstXMinutes": z.number(),
    "takedownsInAlcove": z.number(),
    "takedownsInEnemyFountain": z.number(),
    "teamBaronKills": z.number(),
    "teamDamagePercentage": z.number(),
    "teamElderDragonKills": z.number(),
    "teamRiftHeraldKills": z.number(),
    "tookLargeDamageSurvived": z.number(),
    "turretPlatesTaken": z.number(),
    "turretTakedowns": z.number(),
    "turretsTakenWithRiftHerald": z.number(),
    "twentyMinionsIn3SecondsCount": z.number(),
    "twoWardsOneSweeperCount": z.number(),
    "unseenRecalls": z.number(),
    "visionScoreAdvantageLaneOpponent": z.number(),
    "visionScorePerMinute": z.number(),
    "voidMonsterKill": z.number(),
    "wardTakedowns": z.number(),
    "wardTakedownsBefore20M": z.number(),
    "wardsGuarded": z.number(),
    "junglerKillsEarlyJungle": z.number().optional(),
    "killsOnLanersEarlyJungleAsJungler": z.number().optional(),
    "highestChampionDamage": z.number().optional(),
    "shortestTimeToAceFromFirstTakedown": z.number().optional(),
    "controlWardTimeCoverageInRiverOrEnemyHalf": z.number().optional(),
    "highestWardKills": z.number().optional(),
    "teleportTakedowns": z.number().optional(),
    "highestCrowdControlScore": z.number().optional(),
});
export type Challenges = z.infer<typeof ChallengesSchema>;

export const StatPerksSchema = z.object({
    "defense": z.number(),
    "flex": z.number(),
    "offense": z.number(),
});
export type StatPerks = z.infer<typeof StatPerksSchema>;

export const SelectionSchema = z.object({
    "perk": z.number(),
    "var1": z.number(),
    "var2": z.number(),
    "var3": z.number(),
});
export type Selection = z.infer<typeof SelectionSchema>;

export const BanSchema = z.object({
    "championId": z.number(),
    "pickTurn": z.number(),
});
export type Ban = z.infer<typeof BanSchema>;

export const EpicMonsterKillSchema = z.object({
    "featState": z.number(),
});
export type EpicMonsterKill = z.infer<typeof EpicMonsterKillSchema>;

export const AtakhanSchema = z.object({
    "first": z.boolean(),
    "kills": z.number(),
});
export type Atakhan = z.infer<typeof AtakhanSchema>;

export const MetadataSchema = z.object({
    "dataVersion": z.string(),
    "matchId": z.string(),
    "participants": z.array(z.string()),
});
export type Metadata = z.infer<typeof MetadataSchema>;

export const StyleSchema = z.object({
    "description": DescriptionSchema,
    "selections": z.array(SelectionSchema),
    "style": z.number(),
});
export type Style = z.infer<typeof StyleSchema>;

export const FeatsSchema = z.object({
    "EPIC_MONSTER_KILL": EpicMonsterKillSchema,
    "FIRST_BLOOD": EpicMonsterKillSchema,
    "FIRST_TURRET": EpicMonsterKillSchema,
});
export type Feats = z.infer<typeof FeatsSchema>;

export const ObjectivesSchema = z.object({
    "atakhan": AtakhanSchema,
    "baron": AtakhanSchema,
    "champion": AtakhanSchema,
    "dragon": AtakhanSchema,
    "horde": AtakhanSchema,
    "inhibitor": AtakhanSchema,
    "riftHerald": AtakhanSchema,
    "tower": AtakhanSchema,
});
export type Objectives = z.infer<typeof ObjectivesSchema>;

export const PerksSchema = z.object({
    "statPerks": StatPerksSchema,
    "styles": z.array(StyleSchema),
});
export type Perks = z.infer<typeof PerksSchema>;

export const TeamSchema = z.object({
    "bans": z.array(BanSchema),
    "feats": FeatsSchema,
    "objectives": ObjectivesSchema,
    "teamId": z.number(),
    "win": z.boolean(),
});
export type Team = z.infer<typeof TeamSchema>;

export const ParticipantSchema = z.object({
    "PlayerScore0": z.number(),
    "PlayerScore1": z.number(),
    "PlayerScore10": z.number(),
    "PlayerScore11": z.number(),
    "PlayerScore2": z.number(),
    "PlayerScore3": z.number(),
    "PlayerScore4": z.number(),
    "PlayerScore5": z.number(),
    "PlayerScore6": z.number(),
    "PlayerScore7": z.number(),
    "PlayerScore8": z.number(),
    "PlayerScore9": z.number(),
    "allInPings": z.number(),
    "assistMePings": z.number(),
    "assists": z.number(),
    "baronKills": z.number(),
    "basicPings": z.number(),
    "challenges": ChallengesSchema,
    "champExperience": z.number(),
    "champLevel": z.number(),
    "championId": z.number(),
    "championName": z.string(),
    "championTransform": z.number(),
    "commandPings": z.number(),
    "consumablesPurchased": z.number(),
    "damageDealtToBuildings": z.number(),
    "damageDealtToEpicMonsters": z.number(),
    "damageDealtToObjectives": z.number(),
    "damageDealtToTurrets": z.number(),
    "damageSelfMitigated": z.number(),
    "dangerPings": z.number(),
    "deaths": z.number(),
    "detectorWardsPlaced": z.number(),
    "doubleKills": z.number(),
    "dragonKills": z.number(),
    "eligibleForProgression": z.boolean(),
    "enemyMissingPings": z.number(),
    "enemyVisionPings": z.number(),
    "firstBloodAssist": z.boolean(),
    "firstBloodKill": z.boolean(),
    "firstTowerAssist": z.boolean(),
    "firstTowerKill": z.boolean(),
    "gameEndedInEarlySurrender": z.boolean(),
    "gameEndedInSurrender": z.boolean(),
    "getBackPings": z.number(),
    "goldEarned": z.number(),
    "goldSpent": z.number(),
    "holdPings": z.number(),
    "individualPosition": z.string(),
    "inhibitorKills": z.number(),
    "inhibitorTakedowns": z.number(),
    "inhibitorsLost": z.number(),
    "item0": z.number(),
    "item1": z.number(),
    "item2": z.number(),
    "item3": z.number(),
    "item4": z.number(),
    "item5": z.number(),
    "item6": z.number(),
    "itemsPurchased": z.number(),
    "killingSprees": z.number(),
    "kills": z.number(),
    "lane": LaneSchema,
    "largestCriticalStrike": z.number(),
    "largestKillingSpree": z.number(),
    "largestMultiKill": z.number(),
    "longestTimeSpentLiving": z.number(),
    "magicDamageDealt": z.number(),
    "magicDamageDealtToChampions": z.number(),
    "magicDamageTaken": z.number(),
    "missions": z.record(z.string(), z.number()),
    "needVisionPings": z.number(),
    "neutralMinionsKilled": z.number(),
    "nexusKills": z.number(),
    "nexusLost": z.number(),
    "nexusTakedowns": z.number(),
    "objectivesStolen": z.number(),
    "objectivesStolenAssists": z.number(),
    "onMyWayPings": z.number(),
    "participantId": z.number(),
    "pentaKills": z.number(),
    "perks": PerksSchema,
    "physicalDamageDealt": z.number(),
    "physicalDamageDealtToChampions": z.number(),
    "physicalDamageTaken": z.number(),
    "placement": z.number(),
    "playerAugment1": z.number(),
    "playerAugment2": z.number(),
    "playerAugment3": z.number(),
    "playerAugment4": z.number(),
    "playerAugment5": z.number(),
    "playerAugment6": z.number(),
    "playerSubteamId": z.number(),
    "profileIcon": z.number(),
    "pushPings": z.number(),
    "puuid": z.string(),
    "quadraKills": z.number(),
    "retreatPings": z.number(),
    "riotIdGameName": z.string(),
    "riotIdTagline": z.string(),
    "role": z.string(),
    "roleBoundItem": z.number(),
    "sightWardsBoughtInGame": z.number(),
    "spell1Casts": z.number(),
    "spell2Casts": z.number(),
    "spell3Casts": z.number(),
    "spell4Casts": z.number(),
    "subteamPlacement": z.number(),
    "summoner1Casts": z.number(),
    "summoner1Id": z.number(),
    "summoner2Casts": z.number(),
    "summoner2Id": z.number(),
    "summonerId": z.string(),
    "summonerLevel": z.number(),
    "summonerName": z.string(),
    "teamEarlySurrendered": z.boolean(),
    "teamId": z.number(),
    "teamPosition": z.string(),
    "timeCCingOthers": z.number(),
    "timePlayed": z.number(),
    "totalAllyJungleMinionsKilled": z.number(),
    "totalDamageDealt": z.number(),
    "totalDamageDealtToChampions": z.number(),
    "totalDamageShieldedOnTeammates": z.number(),
    "totalDamageTaken": z.number(),
    "totalEnemyJungleMinionsKilled": z.number(),
    "totalHeal": z.number(),
    "totalHealsOnTeammates": z.number(),
    "totalMinionsKilled": z.number(),
    "totalTimeCCDealt": z.number(),
    "totalTimeSpentDead": z.number(),
    "totalUnitsHealed": z.number(),
    "tripleKills": z.number(),
    "trueDamageDealt": z.number(),
    "trueDamageDealtToChampions": z.number(),
    "trueDamageTaken": z.number(),
    "turretKills": z.number(),
    "turretTakedowns": z.number(),
    "turretsLost": z.number(),
    "unrealKills": z.number(),
    "visionClearedPings": z.number(),
    "visionScore": z.number(),
    "visionWardsBoughtInGame": z.number(),
    "wardsKilled": z.number(),
    "wardsPlaced": z.number(),
    "win": z.boolean(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

export const InfoSchema = z.object({
    "endOfGameResult": z.string(),
    "gameCreation": z.number(),
    "gameDuration": z.number(),
    "gameEndTimestamp": z.number(),
    "gameId": z.number(),
    "gameMode": z.string(),
    "gameName": z.string(),
    "gameStartTimestamp": z.number(),
    "gameType": z.string(),
    "gameVersion": z.string(),
    "mapId": z.number(),
    "participants": z.array(ParticipantSchema),
    "platformId": z.string(),
    "queueId": z.number(),
    "teams": z.array(TeamSchema),
    "tournamentCode": z.string(),
});
export type Info = z.infer<typeof InfoSchema>;

export const RiotMatchSchema = z.object({
    "metadata": MetadataSchema,
    "info": InfoSchema,
});
export type RiotMatch = z.infer<typeof RiotMatchSchema>;
