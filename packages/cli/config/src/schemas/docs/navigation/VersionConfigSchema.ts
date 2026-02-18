import { z } from "zod";
import { AvailabilitySchema } from "../AvailabilitySchema.js";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";
import { NavigationConfigSchema } from "./NavigationConfigSchema.js";

export const VersionConfigSchema = z.object({
    displayName: z.string(),
    path: z.string(),
    slug: z.string().optional(),
    availability: AvailabilitySchema.optional(),
    navigation: NavigationConfigSchema,
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type VersionConfigSchema = z.infer<typeof VersionConfigSchema>;
