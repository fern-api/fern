import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward-compat if new keys are added

export const PluginOutputConfigSchema = z.object({
    path: z.string(),
    pathRelativeToRootOnHost: z.string().nullable(),
});

export type PluginOutputConfigSchema = z.infer<typeof PluginOutputConfigSchema>;

export const FernPluginConfigSchema = z.object({
    irFilepath: z.string(),
    output: PluginOutputConfigSchema.nullable(),
});
