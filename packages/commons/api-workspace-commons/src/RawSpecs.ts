export type RawSpecType = "openapi" | "asyncapi" | "protobuf" | "openrpc" | "graphql";

export interface RawSpecImportSettings {
    respectNullableSchemas?: boolean;
    titleAsSchemaName?: boolean;
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
