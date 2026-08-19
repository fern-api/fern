import { z } from "zod";

export const NugetPublishSchema = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    apiKey: z.string().optional()
});

export type NugetPublishSchema = z.infer<typeof NugetPublishSchema>;
