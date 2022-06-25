import { z } from "zod";
import { GeneratorOutputConfigSchema } from "./GeneratorOutputConfigSchema";
import { GeneratorPublishConfigSchema } from "./GeneratorPublishConfigSchema";
import { HelpersSchema } from "./HelpersSchema";
import { TypescriptGeneratorConfigSchema } from "./TypescriptGeneratorConfigSchema";

// IMPORTANT: don't use strictObject so we're forward-compat if new keys are added

export const FernGeneratorConfigSchema = z.object({
    irFilepath: z.string(),
    output: GeneratorOutputConfigSchema.nullable(),
    publish: GeneratorPublishConfigSchema.nullable(),
    helpers: HelpersSchema,
    customConfig: TypescriptGeneratorConfigSchema,
});

export type FernGeneratorConfigSchema = z.infer<typeof FernGeneratorConfigSchema>;
