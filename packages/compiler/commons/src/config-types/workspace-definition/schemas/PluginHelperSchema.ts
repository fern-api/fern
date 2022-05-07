import { z } from "zod";

export const PluginHelperSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
});

export type PluginHelperSchema = z.infer<typeof PluginHelperSchema>;
