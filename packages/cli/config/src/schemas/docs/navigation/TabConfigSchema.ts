import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

export const TabConfigSchema = z.object({
    displayName: z.string(),
    icon: z.string().optional(),
    slug: z.string().optional(),
    skipSlug: z.boolean().optional(),
    hidden: z.boolean().optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type TabConfigSchema = z.infer<typeof TabConfigSchema>;
