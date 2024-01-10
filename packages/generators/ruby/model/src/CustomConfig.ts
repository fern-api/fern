import { BaseGeneratorConfig, BaseGeneratorConfigSchema } from "@fern-api/generator-commons";

export type RubyModelCustomConfig = BaseGeneratorConfig
export const RubyModelCustomConfigSchema = BaseGeneratorConfigSchema.extend({});

// TODO: this will likely be shared between models and SDK
export function parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
    const parsed = customConfig != null ? RubyModelCustomConfigSchema.parse(customConfig) : undefined;
    return {
        defaultTimeoutInSeconds: parsed?.defaultTimeoutInSeconds ?? parsed?.defaultTimeoutInSeconds,
        extraDependencies: parsed?.extraDependencies ?? {},
        noOptionalProperties: parsed?.noOptionalProperties ?? false,
    };
}
