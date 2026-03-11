import { z } from "zod";

export const RiotAccountSchema = z.object({
    puuid:    z.uuid(),
    gameName: z.string().max(16),
    tagLine:  z.string().max(5)
});


export type RiotAccount = z.infer<typeof RiotAccountSchema>;