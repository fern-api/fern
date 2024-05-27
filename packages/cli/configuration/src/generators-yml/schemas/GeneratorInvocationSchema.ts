import { z } from "zod";
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
    "ir-version": z.optional(z.string()),
    // Feature flag used to enable better IR naming.
    "smart-casing": z.optional(z.boolean()),
    // Temporary way to unblock example serialization.
    "disable-examples": z.optional(z.boolean()),
    // Configures snippets for a particular generator.
    snippets: z.optional(GeneratorSnippetsSchema),
    // Deprecated, use `metadata` on the output block instead.
    "publish-metadata": z.optional(GeneratorPublishMetadataSchema),
    metadata: z.optional(GeneratorPublishMetadataSchema)
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
