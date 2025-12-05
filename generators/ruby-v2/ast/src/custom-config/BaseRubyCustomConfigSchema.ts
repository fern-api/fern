import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

const RangeSchema = z.strictObject({
    version: z.string(),
    specifier: z.optional(z.string())
});

const DependencySchema = z.strictObject({
    upperBound: z.optional(RangeSchema),
    lowerBound: z.optional(RangeSchema)
});

export type ExtraDependenciesSchema = z.infer<typeof ExtraDependenciesSchema>;
export const ExtraDependenciesSchema = z.record(z.union([z.string(), DependencySchema]));

export const BaseRubyCustomConfigSchema = z.object({
    module: z.optional(z.string()),
    clientModuleName: z.optional(z.string()),
    customReadmeSections: z.optional(z.array(CustomReadmeSectionSchema)),
    customPagerName: z.optional(z.string()),
    // Generate wire tests for serialization/deserialization
    enableWireTests: z.boolean().optional(),
    // Extra dependencies to add to the gemspec
    extraDependencies: z.optional(ExtraDependenciesSchema),
    // Extra dev dependencies to add to the Gemfile
    extraDevDependencies: z.optional(ExtraDependenciesSchema)
});

export type BaseRubyCustomConfigSchema = z.infer<typeof BaseRubyCustomConfigSchema>;
