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
    metadata: z.optional(GeneratorPublishMetadataSchema),
    // Overrides the keywords that require safe name variants.
    keywords: z.optional(z.array(z.string())),
    // Configures snippets for a particular generator.
    snippets: z.optional(GeneratorSnippetsSchema),
    // Overrides the version of the IR used by the generator.
    "ir-version": z.optional(z.string()),
    // Feature flag used to enable better IR naming, deprecated
    // use `casing` instead.
    "smart-casing": z.optional(z.boolean()),
    casing: z.optional(z.enum(["V1", "V0"])),
    // Temporary way to unblock example serialization.
    "disable-examples": z.optional(z.boolean()),
    // Deprecated, use `metadata` on the output block instead.
    "publish-metadata": z.optional(GeneratorPublishMetadataSchema)
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
