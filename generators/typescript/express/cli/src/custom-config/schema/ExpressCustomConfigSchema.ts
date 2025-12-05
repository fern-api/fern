import { z } from "zod";

/**
 * Serialization format options:
 * - "default": Use Zurg (bundled runtime) - same as legacy behavior
 * - "zod": Use Zod as npm dependency
 * - "none": No serialization layer - same as noSerdeLayer: true
 */
const SerializationFormatSchema = z.enum(["default", "zod", "none"]);

export const ExpressCustomConfigSchema = z.strictObject({
    useBrandedStringAliases: z.optional(z.boolean()),
    optionalImplementations: z.optional(z.boolean()),
    doNotHandleUnrecognizedErrors: z.optional(z.boolean()),
    treatUnknownAsAny: z.optional(z.boolean()),
    noSerdeLayer: z.optional(z.boolean()),
    serializationFormat: z.optional(SerializationFormatSchema),
    skipRequestValidation: z.optional(z.boolean()),
    skipResponseValidation: z.optional(z.boolean()),
    outputEsm: z.optional(z.boolean()),
    requestValidationStatusCode: z.optional(z.number()),
    useBigInt: z.optional(z.boolean()),
    noOptionalProperties: z.optional(z.boolean()),
    packagePath: z.optional(z.string()),
    packageManager: z.optional(z.enum(["pnpm", "yarn"])),
    linter: z.optional(z.enum(["biome", "oxlint", "none"])),
    formatter: z.optional(z.enum(["prettier", "biome"])),
    enableForwardCompatibleEnums: z.optional(z.boolean()),

    // beta (not in docs)
    outputSourceFiles: z.optional(z.boolean()),
    includeUtilsOnUnionMembers: z.optional(z.boolean()),
    includeOtherInUnionTypes: z.optional(z.boolean()),
    retainOriginalCasing: z.optional(z.boolean()),
    allowExtraFields: z.optional(z.boolean())
});

export type ExpressCustomConfigSchema = z.infer<typeof ExpressCustomConfigSchema>;
