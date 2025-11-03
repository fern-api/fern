import { z } from "zod";

export const ExpressCustomConfigSchema = z.strictObject({
    useBrandedStringAliases: z.optional(z.boolean()),
    optionalImplementations: z.optional(z.boolean()),
    doNotHandleUnrecognizedErrors: z.optional(z.boolean()),
    treatUnknownAsAny: z.optional(z.boolean()),
    noSerdeLayer: z.optional(z.boolean()),
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

    // beta (not in docs)
    outputSourceFiles: z.optional(z.boolean()),
    includeUtilsOnUnionMembers: z.optional(z.boolean()),
    includeOtherInUnionTypes: z.optional(z.boolean()),
    retainOriginalCasing: z.optional(z.boolean()),
    allowExtraFields: z.optional(z.boolean())
});

export type ExpressCustomConfigSchema = z.infer<typeof ExpressCustomConfigSchema>;
