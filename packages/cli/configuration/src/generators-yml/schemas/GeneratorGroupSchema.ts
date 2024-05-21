import { z } from "zod";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";
import { OutputMetadataSchema } from "./OutputMetadataSchema";

export const GeneratorGroupSchema = z.strictObject({
    audiences: z.optional(z.array(z.string())),
    generators: z.array(GeneratorInvocationSchema),
    metadata: z.optional(OutputMetadataSchema)
});

export type GeneratorGroupSchema = z.infer<typeof GeneratorGroupSchema>;
