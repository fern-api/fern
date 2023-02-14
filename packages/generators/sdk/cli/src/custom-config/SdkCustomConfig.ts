export interface SdkCustomConfig {
    useBrandedStringAliases: boolean;
    isPackagePrivate: boolean;
    neverThrowErrors: boolean;
    namespaceExport: string | undefined;
    shouldBundle: boolean;
    includeCredentialsOnCrossOriginRequests: boolean;
}
