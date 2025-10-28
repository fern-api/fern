import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import { z } from "zod";

const defaults = {
    enableWireTests: true,
    decodeNullableToOptional: false
} as const;

export const SdkCustomConfigSchemaDefaults = defaults satisfies SdkCustomConfigSchema;

export const SdkCustomConfigSchema = BaseSwiftCustomConfigSchema.extend({
    enableWireTests: z.boolean().default(defaults.enableWireTests),
    decodeNullableToOptional: z.boolean().default(defaults.decodeNullableToOptional)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
