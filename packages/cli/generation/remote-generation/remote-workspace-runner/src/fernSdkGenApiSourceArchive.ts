import type {
    RawSpecImportSettings,
    RawSpecsManifest,
    RawSpecsManifestEntry,
    RawSpecType
} from "@fern-api/api-workspace-commons";

import type { GenerationConfigRoute } from "./sdk-gen-client/index.js";

export type FernSdkGenApiSourceType = RawSpecType;
export type FernSdkGenApiImportSettings = RawSpecImportSettings;
export type FernSdkGenApiSourceManifestEntry = RawSpecsManifestEntry;
export type FernSdkGenApiSourceManifest = RawSpecsManifest;

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
