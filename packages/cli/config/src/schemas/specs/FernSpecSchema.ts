import { z } from "zod";

export const FernSettingsSchema: z.ZodObject<{}, z.core.$strip> = z.object({
    // TODO: Add Fern-specific settings here.
});

export type FernSettingsSchema = z.infer<typeof FernSettingsSchema>;

export const FernSpecSchema: z.ZodObject<
    { fern: z.ZodString; settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>> },
    z.core.$strip
> = z.object({
    fern: z.string(),
    settings: FernSettingsSchema.optional()
});

export type FernSpecSchema = z.infer<typeof FernSpecSchema>;
