import { z } from "zod";

import { BaseGeneratorConfigSchema } from "@fern-api/ruby-codegen";

export type RubyModelCustomConfig = z.infer<typeof RubyModelCustomConfigSchema>;
export const RubyModelCustomConfigSchema = BaseGeneratorConfigSchema.extend({});

// TODO: this will likely be shared between models and SDK
export function parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
    const parsed = customConfig != null ? RubyModelCustomConfigSchema.parse(customConfig) : undefined;
    return {
        extraDependencies: parsed?.extraDependencies ?? {},
        clientClassName: parsed?.clientClassName
    };
}
