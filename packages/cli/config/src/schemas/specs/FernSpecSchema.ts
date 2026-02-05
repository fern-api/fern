import { z } from "zod";

export const FernSettingsSchema = z.object({
    // TODO: Add Fern-specific settings here.
});

export type FernSettingsSchema = z.infer<typeof FernSettingsSchema>;

export const FernSpecSchema = z.object({
    fern: z.string(),
    settings: FernSettingsSchema.optional()
});

export type FernSpecSchema = z.infer<typeof FernSpecSchema>;
