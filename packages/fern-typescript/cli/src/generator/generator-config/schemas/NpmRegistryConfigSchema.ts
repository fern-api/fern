import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const NpmRegistryConfigSchema = z.object({
    token: z.string(),
    scope: z.string(),
    packagePrefix: z.string(),
});

export type NpmRegistryConfigSchema = z.infer<typeof NpmRegistryConfigSchema>;
