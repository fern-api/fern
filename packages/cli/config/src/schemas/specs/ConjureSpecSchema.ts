import { z } from "zod";

export const ConjureSettingsSchema: z.ZodObject<{}, z.core.$strip> = z.object({
    // TODO: Add Conjure-specific settings here.
});

export type ConjureSettingsSchema = z.infer<typeof ConjureSettingsSchema>;

export const ConjureSpecSchema: z.ZodObject<
    { conjure: z.ZodString; settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>> },
    z.core.$strip
> = z.object({
    conjure: z.string(),
    settings: ConjureSettingsSchema.optional()
});

export type ConjureSpecSchema = z.infer<typeof ConjureSpecSchema>;
