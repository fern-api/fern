import { z } from "zod";
import { GenerateConfigSchema } from "./GenerateConfigSchema";
import { GeneratorHelperReferenceSchema } from "./GeneratorHelperReferenceSchema";

export const GeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    generate: z.union([z.literal(true), GenerateConfigSchema]).optional(),
    config: z.unknown(),
    helpers: z.array(GeneratorHelperReferenceSchema).optional(),
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
