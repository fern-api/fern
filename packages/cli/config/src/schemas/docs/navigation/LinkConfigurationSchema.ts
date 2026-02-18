import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

export const LinkConfigurationSchema = z.object({
    link: z.string(),
    href: z.string(),
    icon: z.string().optional(),
    target: z.enum(["_blank", "_self"]).optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type LinkConfigurationSchema = z.infer<typeof LinkConfigurationSchema>;
