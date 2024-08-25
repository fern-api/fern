import { z } from "zod";

export const ReadmeEndpointObjectSchema = z.strictObject({
    method: z.string(),
    path: z.string(),
    stream: z.optional(z.boolean())
});

export type ReadmeEndpointObjectSchema = z.infer<typeof ReadmeEndpointObjectSchema>;
