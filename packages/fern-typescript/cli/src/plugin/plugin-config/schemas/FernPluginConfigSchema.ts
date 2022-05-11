import { z } from "zod";
import { HelpersSchema } from "./HelpersSchema";
import { PluginOutputConfigSchema } from "./PluginOutputConfigSchema";
import { TypescriptPluginConfigSchema } from "./TypescriptPluginConfigSchema";

// IMPORTANT: don't use strictObject so we're forward-compat if new keys are added

export const FernPluginConfigSchema = z.object({
    irFilepath: z.string(),
    output: PluginOutputConfigSchema.nullable(),
    helpers: HelpersSchema,
    customConfig: TypescriptPluginConfigSchema,
});

export type FernPluginConfigSchema = z.infer<typeof FernPluginConfigSchema>;
