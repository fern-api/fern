import { z } from "zod";
import { GeneratorHelperReferenceSchema } from "./GeneratorHelperReferenceSchema";

export const GeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    output: z.optional(z.string()),
    config: z.unknown(),
    helpers: z.optional(z.array(GeneratorHelperReferenceSchema)),
    publish: z.optional(z.enum(["npm"])),
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
