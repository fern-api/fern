import type { GenerationConfigRoute } from "./sdk-gen-client/index.js";

export type FernSdkGenApiSourceType = "openapi" | "asyncapi" | "protobuf" | "openrpc" | "graphql";

export interface FernSdkGenApiImportSettings {
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

export interface FernSdkGenApiSourceManifestEntry {
    type: FernSdkGenApiSourceType;
    specPath: string;
    overridePaths?: string[];
    namespace?: string;
    apiImportSettings?: FernSdkGenApiImportSettings;
}

export interface FernSdkGenApiSourceManifest {
    specs: FernSdkGenApiSourceManifestEntry[];
}

export interface FernSdkGenApiSourceArchive {
    buffer: Buffer;
    manifest: FernSdkGenApiSourceManifest;
    specIndexes: number[];
}

/** Validates source selections before sdk-gen-api uploads them and constructs per-target IR. */
export function validateFernSdkGenApiSourceCompatibility(
    route: GenerationConfigRoute,
    sourceArchive: FernSdkGenApiSourceArchive
): void {
    if (route.payloadKind !== "sdk-config-v1" || route.configKind !== "sdk-config-v1") {
        return;
    }
    if (sourceArchive.specIndexes.length === 0) {
        throw new Error("SDK Config v1 requires at least one effective Fern source spec");
    }
    const seenIndexes = new Set<number>();
    for (const manifestIndex of sourceArchive.specIndexes) {
        if (seenIndexes.has(manifestIndex)) {
            throw new Error(`Fern target source selection contains duplicate manifest index ${manifestIndex}`);
        }
        seenIndexes.add(manifestIndex);
        const source = sourceArchive.manifest.specs[manifestIndex];
        if (source == null) {
            throw new Error(`Fern source manifest does not contain selected index ${manifestIndex}`);
        }
        if (!isSupportedSourceType(source.type)) {
            throw new Error(
                `Generator ${route.generatorId} ${route.requestedVersion} requires SDK Config v1, but selected source ${manifestIndex} cannot be represented downstream: SDK Config generation does not support Fern source type ${source.type} (${source.specPath}). Use an OpenAPI, AsyncAPI, or GraphQL source for this generator version.`
            );
        }
    }
}

function isSupportedSourceType(type: FernSdkGenApiSourceType): type is "openapi" | "asyncapi" | "graphql" {
    return type === "openapi" || type === "asyncapi" || type === "graphql";
}
