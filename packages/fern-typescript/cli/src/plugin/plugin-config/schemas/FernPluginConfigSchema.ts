import { PluginConfig } from "@fern-api/plugin-runner";
import { z } from "zod";
import { HelpersSchema } from "./HelpersSchema";
import { PluginOutputConfigSchema } from "./PluginOutputConfigSchema";
import { TypescriptPluginConfigSchema } from "./TypescriptPluginConfigSchema";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validatePluginSchema = <S extends z.ZodType<PluginConfig, any, unknown>>(arg: S) => {
    return arg;
};

export const FernPluginConfigSchema = validatePluginSchema(
    z.object({
        irFilepath: z.string(),
        output: PluginOutputConfigSchema.nullable(),
        helpers: HelpersSchema,
        customConfig: TypescriptPluginConfigSchema,
    })
);

export type FernPluginConfigSchema = z.infer<typeof FernPluginConfigSchema>;
