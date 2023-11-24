import { z } from "zod";

export const BaseGeneratorInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    config: z.unknown()
});

export type BaseGeneratorInvocationSchema = z.infer<typeof BaseGeneratorInvocationSchema>;
