import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";
import { NavigationConfigSchema } from "./NavigationConfigSchema.js";
import { VersionConfigSchema } from "./VersionConfigSchema.js";

export const InternalProductConfigSchema = z.object({
    displayName: z.string(),
    icon: z.string().optional(),
    slug: z.string().optional(),
    path: z.string().optional(),
    default: z.boolean().optional(),
    navigation: NavigationConfigSchema.optional(),
    versions: z.array(VersionConfigSchema).optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type InternalProductConfigSchema = z.infer<typeof InternalProductConfigSchema>;

export const ExternalProductConfigSchema = z.object({
    displayName: z.string(),
    icon: z.string().optional(),
    href: z.string(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type ExternalProductConfigSchema = z.infer<typeof ExternalProductConfigSchema>;

export const ProductConfigSchema = z.union([InternalProductConfigSchema, ExternalProductConfigSchema]);

export type ProductConfigSchema = z.infer<typeof ProductConfigSchema>;
