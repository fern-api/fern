import { z } from "zod";
import { AvailabilitySchema } from "../AvailabilitySchema.js";
import { FeatureFlagSchema } from "../FeatureFlagSchema.js";
import { RoleSchema } from "../RoleSchema.js";
import { ApiReferenceLayoutItemSchema } from "./ApiReferenceLayoutItemSchema.js";
import { PlaygroundSettingsSchema } from "./PlaygroundSettingsSchema.js";
import { SnippetsConfigurationSchema } from "./SnippetsConfigurationSchema.js";

export const ApiReferenceConfigurationSchema = z.object({
    api: z.string(),
    apiName: z.string().optional(),
    audiences: z.array(z.string()).optional(),
    displayErrors: z.boolean().optional(),
    title: z.string().optional(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    hidden: z.boolean().optional(),
    skipSlug: z.boolean().optional(),
    flattened: z.boolean().optional(),
    alphabetized: z.boolean().optional(),
    showErrors: z.boolean().optional(),
    snippets: SnippetsConfigurationSchema.optional(),
    summary: z.string().optional(),
    layout: z.array(ApiReferenceLayoutItemSchema).optional(),
    playground: PlaygroundSettingsSchema.optional(),
    availability: AvailabilitySchema.optional(),
    paginated: z.boolean().optional(),
    // WithPermissions
    viewers: RoleSchema.optional(),
    orphaned: z.boolean().optional(),
    // WithFeatureFlags
    featureFlag: FeatureFlagSchema.optional()
});

export type ApiReferenceConfigurationSchema = z.infer<typeof ApiReferenceConfigurationSchema>;
