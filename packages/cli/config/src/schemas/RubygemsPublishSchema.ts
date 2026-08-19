import { z } from "zod";

export const RubygemsPublishSchema = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    apiKey: z.string().optional()
});

export type RubygemsPublishSchema = z.infer<typeof RubygemsPublishSchema>;
