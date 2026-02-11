import { z } from "zod";

export const ExpressCustomConfigSchema: z.ZodObject<
    {
        useBrandedStringAliases: z.ZodOptional<z.ZodBoolean>;
        optionalImplementations: z.ZodOptional<z.ZodBoolean>;
        doNotHandleUnrecognizedErrors: z.ZodOptional<z.ZodBoolean>;
        treatUnknownAsAny: z.ZodOptional<z.ZodBoolean>;
        noSerdeLayer: z.ZodOptional<z.ZodBoolean>;
        skipRequestValidation: z.ZodOptional<z.ZodBoolean>;
        skipResponseValidation: z.ZodOptional<z.ZodBoolean>;
        outputEsm: z.ZodOptional<z.ZodBoolean>;
        requestValidationStatusCode: z.ZodOptional<z.ZodNumber>;
        useBigInt: z.ZodOptional<z.ZodBoolean>;
        noOptionalProperties: z.ZodOptional<z.ZodBoolean>;
        packagePath: z.ZodOptional<z.ZodString>;
        packageManager: z.ZodOptional<z.ZodEnum<["pnpm", "yarn"]>>;
        linter: z.ZodOptional<z.ZodEnum<["biome", "oxlint", "none"]>>;
        formatter: z.ZodOptional<z.ZodEnum<["prettier", "biome", "none"]>>;
        enableForwardCompatibleEnums: z.ZodOptional<z.ZodBoolean>;
        outputSourceFiles: z.ZodOptional<z.ZodBoolean>;
        outputSrcOnly: z.ZodOptional<z.ZodBoolean>;
        includeUtilsOnUnionMembers: z.ZodOptional<z.ZodBoolean>;
        includeOtherInUnionTypes: z.ZodOptional<z.ZodBoolean>;
        retainOriginalCasing: z.ZodOptional<z.ZodBoolean>;
        allowExtraFields: z.ZodOptional<z.ZodBoolean>;
    },
    "strict",
    z.ZodTypeAny,
    {
        outputEsm?: boolean | undefined;
        outputSourceFiles?: boolean | undefined;
        outputSrcOnly?: boolean | undefined;
        skipResponseValidation?: boolean | undefined;
        treatUnknownAsAny?: boolean | undefined;
        noOptionalProperties?: boolean | undefined;
        packagePath?: string | undefined;
        packageManager?: "pnpm" | "yarn" | undefined;
        linter?: "biome" | "oxlint" | "none" | undefined;
        formatter?: "biome" | "none" | "prettier" | undefined;
        enableForwardCompatibleEnums?: boolean | undefined;
        allowExtraFields?: boolean | undefined;
        noSerdeLayer?: boolean | undefined;
        retainOriginalCasing?: boolean | undefined;
        useBigInt?: boolean | undefined;
        useBrandedStringAliases?: boolean | undefined;
        includeUtilsOnUnionMembers?: boolean | undefined;
        includeOtherInUnionTypes?: boolean | undefined;
        optionalImplementations?: boolean | undefined;
        doNotHandleUnrecognizedErrors?: boolean | undefined;
        skipRequestValidation?: boolean | undefined;
        requestValidationStatusCode?: number | undefined;
    },
    {
        outputEsm?: boolean | undefined;
        outputSourceFiles?: boolean | undefined;
        outputSrcOnly?: boolean | undefined;
        skipResponseValidation?: boolean | undefined;
        treatUnknownAsAny?: boolean | undefined;
        noOptionalProperties?: boolean | undefined;
        packagePath?: string | undefined;
        packageManager?: "pnpm" | "yarn" | undefined;
        linter?: "biome" | "oxlint" | "none" | undefined;
        formatter?: "biome" | "none" | "prettier" | undefined;
        enableForwardCompatibleEnums?: boolean | undefined;
        allowExtraFields?: boolean | undefined;
        noSerdeLayer?: boolean | undefined;
        retainOriginalCasing?: boolean | undefined;
        useBigInt?: boolean | undefined;
        useBrandedStringAliases?: boolean | undefined;
        includeUtilsOnUnionMembers?: boolean | undefined;
        includeOtherInUnionTypes?: boolean | undefined;
        optionalImplementations?: boolean | undefined;
        doNotHandleUnrecognizedErrors?: boolean | undefined;
        skipRequestValidation?: boolean | undefined;
        requestValidationStatusCode?: number | undefined;
    }
> = z.strictObject({
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
    formatter: z.optional(z.enum(["prettier", "biome", "none"])),
    enableForwardCompatibleEnums: z.optional(z.boolean()),

    // beta (not in docs)
    outputSourceFiles: z.optional(z.boolean()),
    outputSrcOnly: z.optional(z.boolean()),
    includeUtilsOnUnionMembers: z.optional(z.boolean()),
    includeOtherInUnionTypes: z.optional(z.boolean()),
    retainOriginalCasing: z.optional(z.boolean()),
    allowExtraFields: z.optional(z.boolean())
});

export type ExpressCustomConfigSchema = z.infer<typeof ExpressCustomConfigSchema>;
