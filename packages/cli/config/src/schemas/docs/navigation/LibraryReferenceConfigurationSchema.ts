import { z } from "zod";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";

export const LibraryReferenceConfigurationSchema = z.object({
    library: z.string(),
    title: z.string().optional(),
    slug: z.string().optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    "feature-flag": FeatureFlagSchema.optional()
});

export type LibraryReferenceConfigurationSchema = z.infer<typeof LibraryReferenceConfigurationSchema>;
