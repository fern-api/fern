import { z } from "zod";

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

// Common per-generator configuration flags
export type BaseGeneratorConfigSchema = z.infer<typeof BaseGeneratorConfigSchema>;
export const BaseGeneratorConfigSchema = z.strictObject({
    extraDependencies: z.optional(ExtraDependenciesSchema),
    clientClassName: z.optional(z.string()),
    useProvidedDefaults: z.optional(z.boolean())
});
