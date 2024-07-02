import { z } from "zod";
import { APIDefinitionSettingsSchema } from "./APIConfigurationSchema";
import { GeneratorOutputSchema } from "./GeneratorOutputSchema";
import { GeneratorPublishMetadataSchema } from "./GeneratorPublishMetadataSchema";
import { GeneratorSnippetsSchema } from "./GeneratorSnippetsSchema";
import { GithubConfigurationSchema } from "./GithubConfigurationSchema";

export const GeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    output: z.optional(GeneratorOutputSchema),
    github: z.optional(GithubConfigurationSchema),
    config: z.unknown(),
    metadata: z.optional(GeneratorPublishMetadataSchema),
    // Overrides the keywords that require safe name variants.
    keywords: z.optional(z.array(z.string())),
    // Configures snippets for a particular generator.
    snippets: z.optional(GeneratorSnippetsSchema),
    // Overrides the version of the IR used by the generator.
    "ir-version": z.optional(z.string()),
    // Feature flag used to enable better IR naming.
    "smart-casing": z.optional(z.boolean()),
    // Override API import settings (this is applied across all specs)
    api: z.optional(z.object({ settings: z.optional(APIDefinitionSettingsSchema) })),
    // Temporary way to unblock example serialization.
    "disable-examples": z.optional(z.boolean()),
    // Deprecated, use `metadata` on the output block instead.
    "publish-metadata": z.optional(GeneratorPublishMetadataSchema)
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
