import { z } from "zod";
import { GenerateConfigSchema } from "./GenerateConfigSchema";
import { GeneratorHelperReferenceSchema } from "./GeneratorHelperReferenceSchema";

export const GeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    generate: z.optional(z.union([z.literal(true), GenerateConfigSchema])),
    config: z.unknown(),
    helpers: z.optional(z.array(GeneratorHelperReferenceSchema)),
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
