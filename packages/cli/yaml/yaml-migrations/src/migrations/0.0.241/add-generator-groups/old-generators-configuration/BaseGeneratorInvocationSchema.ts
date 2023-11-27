import { z } from "zod";

export const BaseGeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    config: z.unknown(),
    audiences: z.optional(z.array(z.string()))
});

export type BaseGeneratorInvocationSchema = z.infer<typeof BaseGeneratorInvocationSchema>;
