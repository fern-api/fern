import { z } from "zod";
import { AnnouncementConfigSchema } from "../AnnouncementConfigSchema.js";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";
import { VersionConfigSchema } from "./VersionConfigSchema.js";

/**
 * ProductConfigBase fields shared by InternalProduct and ExternalProduct.
 */
const ProductConfigBaseSchema = z.object({
    "display-name": z.string(),
    subtitle: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    versions: z.array(VersionConfigSchema).optional(),
    audiences: z.union([z.string(), z.array(z.string())]).optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    "feature-flag": FeatureFlagSchema.optional()
});

export const InternalProductConfigSchema = ProductConfigBaseSchema.extend({
    path: z.string(),
    slug: z.string().optional(),
    announcement: AnnouncementConfigSchema.optional()
});

export type InternalProductConfigSchema = z.infer<typeof InternalProductConfigSchema>;

export const ExternalProductConfigSchema = ProductConfigBaseSchema.extend({
    href: z.string(),
    target: z.enum(["_blank", "_self"]).optional()
});

export type ExternalProductConfigSchema = z.infer<typeof ExternalProductConfigSchema>;

export const ProductConfigSchema = z.union([InternalProductConfigSchema, ExternalProductConfigSchema]);

export type ProductConfigSchema = z.infer<typeof ProductConfigSchema>;
