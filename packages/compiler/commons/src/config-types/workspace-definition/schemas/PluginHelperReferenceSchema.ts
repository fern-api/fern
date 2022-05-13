import { z } from "zod";

export const PluginHelperReferenceSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    locationOnDisk: z.optional(z.string()),
});

export type PluginHelperReferenceSchema = z.infer<typeof PluginHelperReferenceSchema>;
