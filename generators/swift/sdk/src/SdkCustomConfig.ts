import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import { z } from "zod";

const defaults = {
    enableWireTests: true,
    nullableAsOptional: false,
    // TODO(next-major): flip default to true
    generateEndpointAvailability: false
} as const;

export const SdkCustomConfigSchemaDefaults = defaults satisfies SdkCustomConfigSchema;

export const SdkCustomConfigSchema = BaseSwiftCustomConfigSchema.extend({
    enableWireTests: z.boolean().default(defaults.enableWireTests),
    nullableAsOptional: z.boolean().default(defaults.nullableAsOptional),
    generateEndpointAvailability: z.boolean().default(defaults.generateEndpointAvailability)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
