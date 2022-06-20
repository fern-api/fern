import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const GeneratorPublishConfigSchema = z.object({
    version: z.string(),
    url: z.string(),
    username: z.string(),
    password: z.string(),
});

export type GeneratorPublishConfigSchema = z.infer<typeof GeneratorPublishConfigSchema>;
