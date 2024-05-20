import { z } from "zod";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";
import { GeneratorMetadataSchema } from "./GeneratorMetadataSchema";

export const GeneratorGroupSchema = z.strictObject({
    audiences: z.optional(z.array(z.string())),
    generators: z.array(GeneratorInvocationSchema),
    metadata: z.optional(GeneratorMetadataSchema)
});

export type GeneratorGroupSchema = z.infer<typeof GeneratorGroupSchema>;
