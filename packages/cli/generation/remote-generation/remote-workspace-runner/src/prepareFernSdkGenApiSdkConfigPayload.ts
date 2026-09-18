import type { FernWorkspace } from "@fern-api/api-workspace-commons";
import type { Audiences, generatorsYml } from "@fern-api/configuration";
import {
    type FernConfigMappingDiagnostic,
    parseSdkConfigV1,
    type SdkConfigV1Document,
    type SdkConfigV1SourceConfig
} from "@postman/sdk-config/sdk-config/v1";

import type { FernSdkGenApiPayload } from "./fernSdkGenApi.js";
import type { FernSdkGenApiSourceArchive, FernSdkGenApiSourceManifestEntry } from "./fernSdkGenApiSourceArchive.js";

type SdkConfigSourceType = "openapi" | "asyncapi" | "graphql";

export interface FernSdkGenApiSdkConfigPayload extends FernSdkGenApiPayload {
    payloadKind: "sdk-config-v1";
    diagnostics: FernConfigMappingDiagnostic[];
}

export interface SdkConfigMappingResult {
    diagnostics: FernConfigMappingDiagnostic[];
    sdkConfig: SdkConfigV1Document;
}

/** Maps a generators.yml group to SDK Config v1; `fern sdk migrate`'s mapper, injected by the CLI. */
export type MapFernGroupToSdkConfig = (args: {
    fernWorkspace: Pick<FernWorkspace, "definition">;
    group: generatorsYml.GeneratorGroup;
    source: SdkConfigV1SourceConfig;
}) => SdkConfigMappingResult;

export function formatSdkConfigMappingDiagnostic(diagnostic: FernConfigMappingDiagnostic): string {
    const destination = diagnostic.sdkConfigPath == null ? "" : `; SDK Config: ${diagnostic.sdkConfigPath.join(".")}`;
    return `[${diagnostic.severity}] [${diagnostic.code}] ${diagnostic.path.join(".")}: ${diagnostic.reason}${destination}; ${diagnostic.suggestedAction}`;
}

/**
 * Builds the `sdk-config-v1` payload for one sdk-gen-api target from its generators.yml
 * invocation. This is the mapping `fern sdk migrate` performs, run in memory for a
 * single-generator group. Sources are described from the archive manifest, in the target's
 * selected order, so their type and namespace match what sdk-gen-api verifies against the
 * uploaded `specs.tar.gz`.
 */
export function prepareFernSdkGenApiSdkConfigPayload({
    workspace,
    generatorInvocation,
    audiences,
    sourceArchive,
    mapFernGroupToSdkConfig
}: {
    workspace: Pick<FernWorkspace, "definition">;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    audiences: Audiences;
    sourceArchive: FernSdkGenApiSourceArchive;
    mapFernGroupToSdkConfig: MapFernGroupToSdkConfig;
}): FernSdkGenApiSdkConfigPayload {
    const mapped = mapFernGroupToSdkConfig({
        fernWorkspace: workspace,
        group: {
            groupName: "sdk-gen-api",
            audiences,
            generators: [generatorInvocation],
            reviewers: undefined
        },
        source: sdkConfigSourceFromArchive(sourceArchive)
    });
    // The mapper returns the document as written, without the defaults the schema applies on
    // parse (`api`, `client`, `package`, `docs`, `generation` default to `{}` since sdk-config
    // 0.3.1). Consumers pinned to an earlier sdk-config (sdk-gen-core) require those keys, so
    // serialize the parsed document: every default is explicit and it validates on both.
    const sdkConfig = parseSdkConfigV1(mapped.sdkConfig);
    return {
        payloadKind: "sdk-config-v1",
        body: Buffer.from(JSON.stringify(sdkConfig), "utf8"),
        diagnostics: mapped.diagnostics
    };
}

function sdkConfigSourceFromArchive(archive: FernSdkGenApiSourceArchive): SdkConfigV1SourceConfig {
    const specs = archive.specIndexes.map((manifestIndex, position) => {
        const entry = archive.manifest.specs[manifestIndex];
        if (entry == null) {
            throw new Error(`Fern source manifest does not contain selected index ${manifestIndex}`);
        }
        if (!isSdkConfigSourceType(entry)) {
            throw new Error(
                `SDK Config generation does not support Fern source type ${entry.type} (${entry.specPath})`
            );
        }
        return {
            id: `source-${position}`,
            type: entry.type,
            // SDK Config v1 requires relative paths; sdk-gen-api matches sources by type and
            // namespace, so the container path's leading slash is the only thing to drop.
            path: entry.specPath.replace(/^\/+/, ""),
            ...(entry.namespace == null ? {} : { namespace: entry.namespace }),
            ...(entry.apiImportSettings == null ? {} : { apiImportSettings: entry.apiImportSettings }),
            ...(entry.overridePaths == null || entry.overridePaths.length === 0
                ? {}
                : { overrides: entry.overridePaths })
        };
    });
    return { specs };
}

function isSdkConfigSourceType(
    entry: FernSdkGenApiSourceManifestEntry
): entry is FernSdkGenApiSourceManifestEntry & { type: SdkConfigSourceType } {
    return entry.type === "openapi" || entry.type === "asyncapi" || entry.type === "graphql";
}
