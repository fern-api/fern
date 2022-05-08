// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

import { z } from "zod";

export const PluginOutputConfigSchema = z.object({
    path: z.string(),
    pathRelativeToRootOnHost: z.string().nullable(),
});

export type PluginOutputConfigSchema = z.infer<typeof PluginOutputConfigSchema>;
