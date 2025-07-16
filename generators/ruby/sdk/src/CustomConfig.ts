import { z } from "zod";

import { BaseGeneratorConfigSchema, ExtraDependenciesSchema } from "@fern-api/ruby-codegen";

export type RubySdkCustomConfig = z.infer<typeof RubySdkCustomConfigSchema>;
export const RubySdkCustomConfigSchema = BaseGeneratorConfigSchema.extend({
    defaultTimeoutInSeconds: z.optional(z.union([z.literal("infinity"), z.number()])),
    extraDevDependencies: z.optional(ExtraDependenciesSchema),
    flattenModuleStructure: z.optional(z.boolean())
});

export type RubySdkCustomConfigConsumed = z.infer<typeof RubySdkCustomConfigSchemaConsumed>;
export const RubySdkCustomConfigSchemaConsumed = BaseGeneratorConfigSchema.extend({
    defaultTimeoutInSeconds: z.optional(z.union([z.literal("infinity"), z.number()])),
    extraDevDependencies: z.optional(ExtraDependenciesSchema),
    flattenModuleStructure: z.boolean()
});

// TODO: this will likely be shared between models and SDK
export function parseCustomConfig(customConfig: unknown): RubySdkCustomConfigConsumed {
    const parsed = customConfig != null ? RubySdkCustomConfigSchema.parse(customConfig) : undefined;
    return {
        defaultTimeoutInSeconds: parsed?.defaultTimeoutInSeconds,
        extraDependencies: parsed?.extraDependencies,
        extraDevDependencies: parsed?.extraDevDependencies,
        clientClassName: parsed?.clientClassName,
        flattenModuleStructure: parsed?.flattenModuleStructure ?? false
    };
}
