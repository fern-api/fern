import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const MavenRegistryConfigSchema = z.object({
    username: z.string(),
    password: z.string(),
    group: z.string(),
    artifactPrefix: z.string(),
});

export type MavenRegistryConfigSchema = z.infer<typeof MavenRegistryConfigSchema>;
