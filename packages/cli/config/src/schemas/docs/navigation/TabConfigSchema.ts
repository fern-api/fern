import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

export const TabConfigSchema = z.object({
    "display-name": z.string(),
    icon: z.string().optional(),
    slug: z.string().optional(),
    "skip-slug": z.boolean().optional(),
    hidden: z.boolean().optional(),
    href: z.string().optional(),
    target: z.enum(["_blank", "_self"]).optional(),
    changelog: z.string().optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    "feature-flag": FeatureFlagSchema.optional()
});

export type TabConfigSchema = z.infer<typeof TabConfigSchema>;
