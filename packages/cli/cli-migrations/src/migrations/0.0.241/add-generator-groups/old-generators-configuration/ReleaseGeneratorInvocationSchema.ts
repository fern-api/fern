import { z } from "zod";

import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";
import { GeneratorPublishingSchema } from "./GeneratorPublishingSchema";
import { GithubRepositoryOutputSchema } from "./GithubRepositoryOutputSchema";

export const ReleaseGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    publishing: z.optional(GeneratorPublishingSchema),
    github: z.optional(GithubRepositoryOutputSchema)
});

export type ReleaseGeneratorInvocationSchema = z.infer<typeof ReleaseGeneratorInvocationSchema>;
