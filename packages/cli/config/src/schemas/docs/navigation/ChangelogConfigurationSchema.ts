import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

export const ChangelogConfigurationSchema = z.object({
    changelog: z.string(),
    title: z.string().optional(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    hidden: z.boolean().optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type ChangelogConfigurationSchema = z.infer<typeof ChangelogConfigurationSchema>;
