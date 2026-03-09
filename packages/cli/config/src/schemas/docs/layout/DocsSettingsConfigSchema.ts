import { z } from "zod";

export const DocsSettingsConfigSchema = z.object({
    substituteEnvVars: z.boolean().optional(),
    codeTheme: z
        .object({
            light: z.string().optional(),
            dark: z.string().optional()
        })
        .optional()
});

export type DocsSettingsConfigSchema = z.infer<typeof DocsSettingsConfigSchema>;
