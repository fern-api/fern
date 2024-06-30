import { z } from "zod";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";
import { OutputMetadataSchema } from "./OutputMetadataSchema";
import { ReviewersSchema, REVIEWERS_KEY } from "./ReviewersSchema";

export const GeneratorGroupSchema = z.strictObject({
    audiences: z.optional(z.array(z.string())),
    generators: z.array(GeneratorInvocationSchema),
    metadata: z.optional(OutputMetadataSchema),
    [REVIEWERS_KEY]: z.optional(ReviewersSchema)
});

export type GeneratorGroupSchema = z.infer<typeof GeneratorGroupSchema>;
