// this is the parsed config shape. to view the allowed options for generators.yml,
// see SdkCustomConfigSchema.ts
export interface SdkCustomConfig {
    useBrandedStringAliases: boolean;
    isPackagePrivate: boolean;
    neverThrowErrors: boolean;
    namespaceExport: string | undefined;
    outputEsm: boolean;
    includeCredentialsOnCrossOriginRequests: boolean;
    shouldBundle: boolean;
    allowCustomFetcher: boolean;
    includeUtilsOnUnionMembers: boolean;
    includeOtherInUnionTypes: boolean;
    requireDefaultEnvironment: boolean;
    defaultTimeoutInSeconds: number | "infinity" | undefined;
    skipResponseValidation: boolean;
    extraDependencies: Record<string, string>;
    treatUnknownAsAny: boolean;
    includeContentHeadersOnFileDownloadResponse: boolean;
    noSerdeLayer: boolean;
}
