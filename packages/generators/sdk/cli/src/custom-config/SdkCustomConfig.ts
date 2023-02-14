export interface SdkCustomConfig {
    useBrandedStringAliases: boolean;
    isPackagePrivate: boolean;
    neverThrowErrors: boolean;
    namespaceExport: string | undefined;
    outputEsm: boolean;
    includeCredentialsOnCrossOriginRequests: boolean;
    shouldBundle: boolean;
}
