import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";
import { NavigationItemSchema } from "./NavigationItemSchema.js";

export const TabVariantSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    icon: z.string().optional(),
    layout: z.array(NavigationItemSchema),
    slug: z.string().optional(),
    "skip-slug": z.boolean().optional(),
    hidden: z.boolean().optional(),
    default: z.boolean().optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    "feature-flag": FeatureFlagSchema.optional()
});

export type TabVariantSchema = z.infer<typeof TabVariantSchema>;
