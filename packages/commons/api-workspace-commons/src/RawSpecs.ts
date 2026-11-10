export type RawSpecType = "openapi" | "asyncapi" | "protobuf" | "openrpc" | "graphql";

export interface RawSpecImportSettings {
    respectNullableSchemas?: boolean;
    titleAsSchemaName?: boolean;
    ignoreTags?: boolean;
    disambiguateRequestNames?: boolean;
    respectReadonlySchemas?: boolean;
    discriminatedUnionV2?: boolean;
    undiscriminatedUnionsWithLiterals?: boolean;
    inlineAllOfSchemas?: boolean;
    resolveSchemaCollisions?: boolean;
    asyncApiMessageNaming?: "v1" | "v2";
    coerceEnumsToLiterals?: boolean;
    idiomaticRequestNames?: boolean;
    wrapReferencesToNullableInOptional?: boolean;
    coerceOptionalSchemasToNullable?: boolean;
    pathParameterOrder?: "url-order" | "spec-order";
    onlyIncludeReferencedSchemas?: boolean;
    objectQueryParameters?: boolean;
    typeDatesAsStrings?: boolean;
    groupMultiApiEnvironments?: boolean;
    defaultIntegerFormat?: "int32" | "int64" | "uint32" | "uint64";
    // The settings below are in SDK Config since @postman/sdk-config 0.21.0. They are only written when they differ
    // from the default, so a server that predates them never sees them from a spec that does not use them.
    inferDiscriminatedUnionBaseProperties?: boolean;
    respectByteFormat?: boolean;
    additionalPropertiesDefaultsTo?: boolean;
    optionalAdditionalProperties?: boolean;
    anyOfSiblingPropertiesAsObject?: boolean;
    preserveSingleSchemaOneOf?: boolean;
    preserveOneOfInAllOf?: boolean;
    removeDiscriminantsFromSchemas?: "always" | "never";
    coerceConstsTo?: "literals" | "enums" | "enums-coerceable-to-literals";
    resolveAliases?: boolean | { except?: string[] };
    respectForwardCompatibleEnums?: boolean;
    inferForwardCompatible?: boolean;
    respectOperationIdWordBoundaries?: boolean;
    namespacedErrors?: boolean;
    defaultFormParameterEncoding?: "form" | "json";
    respectParameterContent?: boolean;
    useBytesForBinaryResponse?: boolean;
    useReadVariantForResponses?: boolean;
    exampleGeneration?: { request?: { maxDepth?: number }; response?: { maxDepth?: number } };
    filter?: { endpoints: string[] };
    groupEnvironmentsByHost?: boolean;
    multiServerStrategy?: "environment-per-server" | "urls-per-environment";
    inferDefaultEnvironment?: boolean;
    respectPerSpecBasePath?: boolean;
    errorResponses?: {
        schema: Record<string, unknown>;
        name?: string;
        applyTo?: "all" | "untyped";
        ensure?: Array<{
            statusCode: number;
            methods?: Array<"get" | "post" | "put" | "patch" | "delete" | "head" | "options" | "trace">;
        }>;
    };
}

export interface RawSpecsManifestEntry {
    type: RawSpecType;
    specPath: string;
    overridePaths?: string[];
    namespace?: string;
    apiImportSettings?: RawSpecImportSettings;
}

export interface RawSpecsManifest {
    specs: RawSpecsManifestEntry[];
}
