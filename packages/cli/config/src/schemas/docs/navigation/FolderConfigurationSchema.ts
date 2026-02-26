import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

/**
 * FolderConfigurationSchema uses NavigationItemSchema via z.lazy()
 * to handle recursive navigation structures.
 *
 * The `contents` field is typed as z.ZodTypeAny because z.lazy
 * cannot resolve the recursive type at declaration time.
 */
export const FolderConfigurationSchema = z.object({
    folder: z.string(),
    title: z.string().optional(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    hidden: z.boolean().optional(),
    collapsed: z.boolean().optional(),
    collapsible: z.boolean().optional(),
    collapsedByDefault: z.boolean().optional(),
    path: z.string().optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type FolderConfigurationSchema = z.infer<typeof FolderConfigurationSchema>;
