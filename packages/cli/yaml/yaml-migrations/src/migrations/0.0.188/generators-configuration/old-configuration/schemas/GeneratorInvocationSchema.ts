import { z } from "zod";
import { GenerateConfigSchema } from "./GenerateConfigSchema";

export const GeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    generate: z.optional(z.union([z.literal(true), GenerateConfigSchema])),
    config: z.unknown()
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
