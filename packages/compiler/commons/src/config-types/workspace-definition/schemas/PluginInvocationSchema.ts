import { z } from "zod";
import { PluginHelperReferenceSchema } from "./PluginHelperReferenceSchema";

export const PluginInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    output: z.optional(z.string()),
    config: z.unknown(),
    helpers: z.optional(z.array(PluginHelperReferenceSchema)),
});

export type PluginInvocationSchema = z.infer<typeof PluginInvocationSchema>;
