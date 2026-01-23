import { z } from "zod";

export const AsyncApiSettingsSchema = z.object({
    // TODO: Add AsyncAPI-specific settings here.
});

export type AsyncApiSettingsSchema = z.infer<typeof AsyncApiSettingsSchema>;

export const AsyncApiSpecSchema = z.object({
    asyncapi: z.string(),
    overrides: z.string().optional(),
    settings: AsyncApiSettingsSchema.optional()
});

export type AsyncApiSpecSchema = z.infer<typeof AsyncApiSpecSchema>;
