import { z } from "zod";

export const ConjureSettingsSchema = z.object({
    // TODO: Add Conjure-specific settings here.
});

export type ConjureSettingsSchema = z.infer<typeof ConjureSettingsSchema>;

export const ConjureSpecSchema = z.object({
    conjure: z.string(),
    settings: ConjureSettingsSchema.optional()
});

export type ConjureSpecSchema = z.infer<typeof ConjureSpecSchema>;
