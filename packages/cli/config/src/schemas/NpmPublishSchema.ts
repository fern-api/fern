import { z } from "zod";

export const NpmPublishSchema = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    token: z.string().optional()
});

export type NpmPublishSchema = z.infer<typeof NpmPublishSchema>;
