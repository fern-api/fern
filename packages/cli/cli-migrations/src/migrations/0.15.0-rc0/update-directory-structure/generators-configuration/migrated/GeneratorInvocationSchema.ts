import { z } from "zod";

import { GeneratorOutputSchema } from "./GeneratorOutputSchema";
import { GithubConfigurationSchema } from "./GithubConfigurationSchema";

export const GeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    output: z.optional(GeneratorOutputSchema),
    github: z.optional(GithubConfigurationSchema),
    config: z.unknown()
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
