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
    shouldGenerateWebsocketClients: boolean;
    includeUtilsOnUnionMembers: boolean;
    includeOtherInUnionTypes: boolean;
    requireDefaultEnvironment: boolean;
    defaultTimeoutInSeconds: number | "infinity" | undefined;
    skipResponseValidation: boolean;
    extraDependencies: Record<string, string>;
    extraDevDependencies: Record<string, string>;
    extraPeerDependencies: Record<string, string>;
    extraPeerDependenciesMeta: Record<string, unknown>;
    treatUnknownAsAny: boolean;
    includeContentHeadersOnFileDownloadResponse: boolean;
    noSerdeLayer: boolean;
    noOptionalProperties: boolean;
    includeApiReference: boolean | undefined;
    tolerateRepublish: boolean;
    retainOriginalCasing: boolean | undefined;
    allowExtraFields: boolean | undefined;
    inlineFileProperties: boolean | undefined;
    inlinePathParameters: boolean | undefined;
    enableInlineTypes: boolean | undefined;
    packageJson: Record<string, unknown> | undefined;
    publishToJsr: boolean | undefined;
    omitUndefined: boolean | undefined;
    generateWireTests: boolean | undefined;
    noScripts: boolean | undefined;
    useBigInt: boolean | undefined;
    useLegacyExports: boolean | undefined;
}
