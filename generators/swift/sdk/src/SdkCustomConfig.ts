import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import { z } from "zod";

const defaults = {
    enableWireTests: true,
    nullableAsOptional: false,
    enableForwardCompatibleEnums: false
} as const;

export const SdkCustomConfigSchemaDefaults = defaults satisfies SdkCustomConfigSchema;

export const SdkCustomConfigSchema = BaseSwiftCustomConfigSchema.extend({
    enableWireTests: z.boolean().default(defaults.enableWireTests),
    nullableAsOptional: z.boolean().default(defaults.nullableAsOptional),
    enableForwardCompatibleEnums: z.boolean().default(defaults.enableForwardCompatibleEnums)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
