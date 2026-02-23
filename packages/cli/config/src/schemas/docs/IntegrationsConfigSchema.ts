import { z } from "zod";

export const IntercomConfigSchema = z.object({
    appId: z.string(),
    apiBase: z.string().optional()
});

export type IntercomConfigSchema = z.infer<typeof IntercomConfigSchema>;

export const IntegrationsConfigSchema = z.object({
    intercom: IntercomConfigSchema.optional()
});

export type IntegrationsConfigSchema = z.infer<typeof IntegrationsConfigSchema>;
