import { z } from "zod";
import { PluginHelperSchema } from "./PluginHelperSchema";

export const PluginInvocationSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    output: z.optional(z.string()),
    config: z.unknown(),
    helpers: z.optional(z.array(PluginHelperSchema)),
});

export type PluginInvocationSchema = z.infer<typeof PluginInvocationSchema>;
