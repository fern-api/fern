import { z } from "zod";

export const PluginHelperSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    locationOnDisk: z.optional(z.string()),
});

export type PluginHelperSchema = z.infer<typeof PluginHelperSchema>;
