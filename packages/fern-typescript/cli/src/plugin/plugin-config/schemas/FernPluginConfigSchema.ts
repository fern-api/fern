import { z } from "zod";
import { TypescriptPluginConfigSchema } from "./TypescriptPluginConfigSchema";

// not using strictObject so we're forward compat if new keys are added
export const FernPluginConfigSchema = z.object({
    irFilepath: z.string(),
    outputDirectory: z.string(),
    config: TypescriptPluginConfigSchema,
});

export type FernPluginConfigSchema = z.infer<typeof FernPluginConfigSchema>;
