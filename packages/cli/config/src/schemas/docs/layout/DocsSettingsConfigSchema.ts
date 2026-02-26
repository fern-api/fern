import { z } from "zod";

export const DocsSettingsConfigSchema = z.object({
    substituteEnvVars: z.boolean().optional()
});

export type DocsSettingsConfigSchema = z.infer<typeof DocsSettingsConfigSchema>;
