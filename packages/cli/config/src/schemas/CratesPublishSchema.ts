import { z } from "zod";

export const CratesPublishSchema = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    token: z.string().optional()
});

export type CratesPublishSchema = z.infer<typeof CratesPublishSchema>;
