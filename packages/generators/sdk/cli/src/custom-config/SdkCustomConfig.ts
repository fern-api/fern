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
    timeoutInSeconds: number | "infinity" | undefined;
}
