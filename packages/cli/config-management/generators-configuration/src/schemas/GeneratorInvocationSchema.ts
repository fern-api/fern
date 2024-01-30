import { z } from "zod";
import { GeneratorOutputSchema } from "./GeneratorOutputSchema";
import { GithubConfigurationSchema } from "./GithubConfigurationSchema";

export const GeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    output: z.optional(GeneratorOutputSchema),
    github: z.optional(GithubConfigurationSchema),
    config: z.unknown(),
    // Feature flag used to enable better IR naming.
    "special-casing": z.optional(z.boolean()),
    // Temporary way to unblock example serialization
    "disable-examples": z.optional(z.boolean())
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
