import { z } from "zod";

export const FeatureFlagConfigurationSchema = z.object({
    flag: z.string(),
    fallbackValue: z.unknown().optional(),
    match: z.unknown().optional()
});

export type FeatureFlagConfigurationSchema = z.infer<typeof FeatureFlagConfigurationSchema>;

export const FeatureFlagSchema = z.union([z.string(), FeatureFlagConfigurationSchema]);

export type FeatureFlagSchema = z.infer<typeof FeatureFlagSchema>;
