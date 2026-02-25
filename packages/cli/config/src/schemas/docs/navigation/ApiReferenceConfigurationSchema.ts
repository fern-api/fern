import { z } from "zod";
import { AvailabilitySchema } from "../AvailabilitySchema.js";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";
import { ApiReferenceLayoutItemSchema } from "./ApiReferenceLayoutItemSchema.js";
import { PlaygroundSettingsSchema } from "./PlaygroundSettingsSchema.js";
import { SnippetsConfigurationSchema } from "./SnippetsConfigurationSchema.js";

export const ApiReferenceConfigurationSchema = z.object({
    api: z.string(),
    "api-name": z.string().optional(),
    openrpc: z.string().optional(),
    audiences: z.union([z.string(), z.array(z.string())]).optional(),
    "display-errors": z.boolean().optional(),
    "tag-description-pages": z.boolean().optional(),
    snippets: SnippetsConfigurationSchema.optional(),
    postman: z.string().optional(),
    summary: z.string().optional(),
    layout: z.array(ApiReferenceLayoutItemSchema).optional(),
    collapsed: z.boolean().optional(),
    icon: z.string().optional(),
    slug: z.string().optional(),
    hidden: z.boolean().optional(),
    availability: AvailabilitySchema.optional(),
    "skip-slug": z.boolean().optional(),
    alphabetized: z.boolean().optional(),
    flattened: z.boolean().optional(),
    paginated: z.boolean().optional(),
    playground: PlaygroundSettingsSchema.optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    "feature-flag": FeatureFlagSchema.optional()
});

export type ApiReferenceConfigurationSchema = z.infer<typeof ApiReferenceConfigurationSchema>;
