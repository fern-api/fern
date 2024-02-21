// this is the parsed config shape. to view the allowed options for generators.yml,
// see SdkCustomConfigSchema.ts
export interface SdkCustomConfig {
    useBrandedStringAliases: boolean;
    isPackagePrivate: boolean;
    neverThrowErrors: boolean;
    namespaceExport: string | undefined;
    outputEsm: boolean;
    outputSourceFiles: boolean;
    includeCredentialsOnCrossOriginRequests: boolean;
    shouldBundle: boolean;
    allowCustomFetcher: boolean;
    includeUtilsOnUnionMembers: boolean;
    includeOtherInUnionTypes: boolean;
    requireDefaultEnvironment: boolean;
    defaultTimeoutInSeconds: number | "infinity" | undefined;
    skipResponseValidation: boolean;
    extraDependencies: Record<string, string>;
    extraDevDependencies: Record<string, string>;
    treatUnknownAsAny: boolean;
    includeContentHeadersOnFileDownloadResponse: boolean;
    noSerdeLayer: boolean;
    noOptionalProperties: boolean;
    includeApiReference: boolean | undefined;
}
