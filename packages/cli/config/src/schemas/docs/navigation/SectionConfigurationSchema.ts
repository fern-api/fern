import { z } from "zod";
import { AvailabilitySchema } from "../AvailabilitySchema.js";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- z.lazy defers access, avoiding TDZ issues with circular ESM imports
let _navigationItemSchema: z.ZodTypeAny;

/**
 * Injects the NavigationItemSchema to break the circular dependency
 * between SectionConfigurationSchema and NavigationItemSchema.
 *
 * Called from NavigationItemSchema.ts after both schemas are defined.
 */
export function _injectNavigationItemSchema(schema: z.ZodTypeAny): void {
    _navigationItemSchema = schema;
}

/**
 * SectionConfigurationSchema is a recursive schema - its `contents` field
 * contains NavigationItemSchema[], which itself includes SectionConfigurationSchema.
 *
 * We use z.lazy() to break the circular dependency.
 */
export const SectionConfigurationSchema = z.object({
    section: z.string(),
    path: z.string().optional(),
    contents: z.lazy(() => z.array(_navigationItemSchema)),
    collapsed: z.boolean().optional(),
    collapsible: z.boolean().optional(),
    "collapsed-by-default": z.boolean().optional(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    hidden: z.boolean().optional(),
    "skip-slug": z.boolean().optional(),
    availability: AvailabilitySchema.optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    "feature-flag": FeatureFlagSchema.optional()
});

export type SectionConfigurationSchema = z.infer<typeof SectionConfigurationSchema>;
