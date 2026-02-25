import { z } from "zod";
import { AnnouncementConfigSchema } from "../AnnouncementConfigSchema.js";
import { AvailabilitySchema } from "../AvailabilitySchema.js";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

export const VersionConfigSchema = z.object({
    "display-name": z.string(),
    path: z.string(),
    slug: z.string().optional(),
    availability: AvailabilitySchema.optional(),
    audiences: z.union([z.string(), z.array(z.string())]).optional(),
    hidden: z.boolean().optional(),
    announcement: AnnouncementConfigSchema.optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    "feature-flag": FeatureFlagSchema.optional()
});

export type VersionConfigSchema = z.infer<typeof VersionConfigSchema>;
