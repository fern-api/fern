import { z } from "zod";

import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema.js";
import { GeneratorPublishingSchema } from "./GeneratorPublishingSchema.js";
import { GithubRepositoryOutputSchema } from "./GithubRepositoryOutputSchema.js";

export const ReleaseGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    publishing: z.optional(GeneratorPublishingSchema),
    github: z.optional(GithubRepositoryOutputSchema)
});

export type ReleaseGeneratorInvocationSchema = z.infer<typeof ReleaseGeneratorInvocationSchema>;
