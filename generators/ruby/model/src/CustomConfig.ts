import { BaseGeneratorConfigSchema } from "@fern-api/ruby-codegen";
import { z } from "zod";

export type RubyModelCustomConfig = z.infer<typeof RubyModelCustomConfigSchema>;
export const RubyModelCustomConfigSchema: z.ZodObject<{ extraDependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{ upperBound: z.ZodOptional<z.ZodObject<{ version: z.ZodString; specifier: z.ZodOptional<z.ZodString>; }, "strict", z.ZodTypeAny, { version: string; specifier?: string | undefined; }, { version: string; specifier?: string | undefined; }>>; lowerBound: z.ZodOptional<z.ZodObject<{ version: z.ZodString; specifier: z.ZodOptional<z.ZodString>; }, "strict", z.ZodTypeAny, { version: string; specifier?: string | undefined; }, { version: string; specifier?: string | undefined; }>>; }, "strict", z.ZodTypeAny, { upperBound?: { version: string; specifier?: string | undefined; } | undefined; lowerBound?: { version: string; specifier?: string | undefined; } | undefined; }, { upperBound?: { version: string; specifier?: string | undefined; } | undefined; lowerBound?: { version: string; specifier?: string | undefined; } | undefined; }>]>>>; clientClassName: z.ZodOptional<z.ZodString>; useProvidedDefaults: z.ZodOptional<z.ZodBoolean>; }, "strict", z.ZodTypeAny, { extraDependencies?: Record<string, string | { upperBound?: { version: string; specifier?: string | undefined; } | undefined; lowerBound?: { version: string; specifier?: string | undefined; } | undefined; }> | undefined; clientClassName?: string | undefined; useProvidedDefaults?: boolean | undefined; }, { extraDependencies?: Record<string, string | { upperBound?: { version: string; specifier?: string | undefined; } | undefined; lowerBound?: { version: string; specifier?: string | undefined; } | undefined; }> | undefined; clientClassName?: string | undefined; useProvidedDefaults?: boolean | undefined; }> = BaseGeneratorConfigSchema.extend({});

// TODO: this will likely be shared between models and SDK
export function parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
    const parsed = customConfig != null ? RubyModelCustomConfigSchema.parse(customConfig) : undefined;
    return {
        extraDependencies: parsed?.extraDependencies ?? {},
        clientClassName: parsed?.clientClassName
    };
}
