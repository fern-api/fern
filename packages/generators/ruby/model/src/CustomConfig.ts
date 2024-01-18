import { BaseGeneratorConfig, BaseGeneratorConfigSchema } from "@fern-api/generator-commons";
import { z } from "zod";

export interface RubyModelCustomConfig extends BaseGeneratorConfig {
    clientName: string | undefined;
}
export const RubyModelCustomConfigSchema = BaseGeneratorConfigSchema.extend({
    clientName: z.optional(z.string())
});

// TODO: this will likely be shared between models and SDK
export function parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
    const parsed = customConfig != null ? RubyModelCustomConfigSchema.parse(customConfig) : undefined;
    return {
        defaultTimeoutInSeconds: parsed?.defaultTimeoutInSeconds ?? parsed?.defaultTimeoutInSeconds,
        extraDependencies: parsed?.extraDependencies ?? {},
        noOptionalProperties: parsed?.noOptionalProperties ?? false,
        clientName: parsed?.clientName
    };
}
