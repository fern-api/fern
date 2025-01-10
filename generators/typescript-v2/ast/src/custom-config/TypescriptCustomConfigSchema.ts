import { z } from "zod";

// The full set of configuration options supported by the TypeScript SDK generator.
export const TypescriptCustomConfigSchema = z.strictObject({
    neverThrowErrors: z.optional(z.boolean()),
    outputEsm: z.optional(z.boolean()),
    outputSourceFiles: z.optional(z.boolean()),
    includeCredentialsOnCrossOriginRequests: z.optional(z.boolean()),
    bundle: z.optional(z.boolean()),
    allowCustomFetcher: z.optional(z.boolean()),
    defaultTimeoutInSeconds: z.optional(z.union([z.literal("infinity"), z.number()])),
    skipResponseValidation: z.optional(z.boolean()),
    extraDependencies: z.optional(z.record(z.string())),
    extraDevDependencies: z.optional(z.record(z.string())),
    extraPeerDependencies: z.optional(z.record(z.string())),
    extraPeerDependenciesMeta: z.optional(z.record(z.any())),
    treatUnknownAsAny: z.optional(z.boolean()),
    noOptionalProperties: z.optional(z.boolean()),
    tolerateRepublish: z.optional(z.boolean()),
    packageJson: z.optional(z.record(z.any())),
    publishToJsr: z.optional(z.boolean()),
    omitUndefined: z.optional(z.boolean()),
    useLegacyExports: z.optional(z.boolean()),

    // relevant to dynamic snippets
    allowExtraFields: z.optional(z.boolean()),
    enableInlineTypes: z.optional(z.boolean()),
    inlineFileProperties: z.optional(z.boolean()),
    inlinePathParameters: z.optional(z.boolean()),
    namespaceExport: z.optional(z.string()),
    noSerdeLayer: z.optional(z.boolean()),
    private: z.optional(z.boolean()),
    requireDefaultEnvironment: z.optional(z.boolean()),
    retainOriginalCasing: z.optional(z.boolean()),
    useBigInt: z.optional(z.boolean()),
    useBrandedStringAliases: z.optional(z.boolean()),

    // beta (not in docs)
    includeContentHeadersOnFileDownloadResponse: z.optional(z.boolean()),
    includeUtilsOnUnionMembers: z.optional(z.boolean()),
    includeOtherInUnionTypes: z.optional(z.boolean()),
    generateWireTests: z.optional(z.boolean()),
    noScripts: z.optional(z.boolean()),

    // deprecated
    timeoutInSeconds: z.optional(z.union([z.literal("infinity"), z.number()])),
    includeApiReference: z.optional(z.boolean())
});

export type TypescriptCustomConfigSchema = z.infer<typeof TypescriptCustomConfigSchema>;
