import {
    exposesSourceSpecs,
    type RawSpecsManifestEntry,
    type SourceSpecExposingWorkspace
} from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration-loader";
import { convertProtobufSpecs, LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import {
    type ConvertProtobufSpecs,
    createGroupedSpecsTarGzArchiveSettled,
    createSpecsTarGzArchive,
    generatorWantsSpecs,
    prepareSdkSourceSpecs,
    rewriteSdkConfigSourceSpecs,
    type SdkSourceSpec,
    validateSdkConfigImportSettings
} from "@fern-api/local-workspace-runner";
import {
    type FernSdkConfigV1Payload,
    type FernSourceArchiveRequest,
    type FernSourceArchiveResolution
} from "@fern-api/remote-workspace-runner";
import { CliError, TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import type { SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";

export function createFernSourceArchiveResolver({
    workspace,
    context,
    group,
    sdkConfigV1
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    context: TaskContext;
    group: generatorsYml.GeneratorGroup;
    sdkConfigV1?: FernSdkConfigV1Payload;
}): (requests: FernSourceArchiveRequest[]) => Promise<FernSourceArchiveResolution> {
    return async (requests) => {
        const audiences =
            sdkConfigV1 == null
                ? group.audiences
                : sdkConfigV1.audiences == null
                  ? ({ type: "all" } as const)
                  : ({ type: "select", audiences: sdkConfigV1.audiences } as const);
        const sourceArchives: FernSourceArchiveResolution["sourceArchives"] = new Map();
        const errors = new Map<number, unknown>();
        if (!exposesSourceSpecs(workspace)) {
            for (const request of requests) {
                if (requestRequiresSourceArchive(request)) {
                    errors.set(
                        request.generatorIndex,
                        new Error(
                            `Generator index ${request.generatorIndex} (${request.generatorInvocation.name}) requires a source archive, but workspace type ${workspace.type} does not expose source specs`
                        )
                    );
                }
            }
            return { sourceArchives, errors };
        }

        const settledSelections = await Promise.allSettled(
            requests.map(async (request) => {
                if (request.sdkGenApiRoute == null) {
                    return undefined;
                }
                if (workspace instanceof LazyFernWorkspace && !(await workspace.composesSourceSpecs())) {
                    throw fernDefinitionDeprecatedError(workspace);
                }
                if (request.sdkGenApiRoute.payloadKind !== "sdk-config-v1") {
                    return {
                        specs: await workspace.getAllSpecsForGenerator(request.generatorInvocation.apiOverride?.specs)
                    };
                }
                const { sources, sourceSpecCount } = await prepareSdkSources({ workspace, request, context });
                const specs = sources.map(({ spec }) => spec);
                validateSdkConfigImportSettings(specs, {
                    clientPathParameterStyle: getClientPathParameterStyle(request, sdkConfigV1)
                });
                return { specs, sources: { sources, sourceSpecCount } };
            })
        );
        const sdkSourcesByGeneratorIndex = new Map<number, PreparedSdkSources>();
        const generatorSelections = settledSelections.flatMap((result, index) => {
            const request = requests[index];
            if (request == null) {
                throw new Error(`Missing source archive request at settled index ${index}`);
            }
            if (result.status === "rejected") {
                errors.set(request.generatorIndex, result.reason);
                return [];
            }
            if (result.value == null) {
                return [];
            }
            if (result.value.sources != null) {
                sdkSourcesByGeneratorIndex.set(request.generatorIndex, result.value.sources);
            }
            return [{ generatorIndex: request.generatorIndex, specs: result.value.specs }];
        });
        if (generatorSelections.length > 0) {
            const settledArchive = await createGroupedSpecsTarGzArchiveSettled({
                generatorSelections,
                context,
                audiences
            });
            for (const [generatorIndex, error] of settledArchive.errorsByGeneratorIndex) {
                errors.set(generatorIndex, error);
            }
            if (settledArchive.archive != null) {
                const { specIndexesByGeneratorIndex, ...sourceArchive } = settledArchive.archive;
                for (const [generatorIndex, specIndexes] of specIndexesByGeneratorIndex) {
                    const request = requests.find((candidate) => candidate.generatorIndex === generatorIndex);
                    const sources = sdkSourcesByGeneratorIndex.get(generatorIndex);
                    try {
                        const sdkConfigSourceSpecs =
                            request == null || sources == null
                                ? undefined
                                : getSdkConfigSourceSpecs({
                                      prepared: sources,
                                      manifestEntries: sourceArchive.manifest.specs,
                                      specIndexes,
                                      sdkConfigV1,
                                      sdkConfigTargetIndex: request.sdkConfigTargetIndex
                                  });
                        sourceArchives.set(generatorIndex, {
                            ...sourceArchive,
                            specIndexes,
                            ...(sdkConfigSourceSpecs == null ? {} : { sdkConfigSourceSpecs })
                        });
                    } catch (error) {
                        errors.set(generatorIndex, error);
                    }
                }
            }
        }

        const rootRequests = requests.filter(
            (request) =>
                request.sdkGenApiRoute == null &&
                generatorWantsSpecs(request.generatorInvocation.name, request.generatorInvocation.version) &&
                !errors.has(request.generatorIndex)
        );
        if (rootRequests.length > 0) {
            try {
                const archive = await createSpecsTarGzArchive({
                    specs: await workspace.getSourceSpecs(),
                    context,
                    audiences
                });
                const specIndexes = archive.manifest.specs.map((_, index) => index);
                for (const request of rootRequests) {
                    sourceArchives.set(request.generatorIndex, { ...archive, specIndexes });
                }
            } catch (error) {
                for (const request of rootRequests) {
                    errors.set(request.generatorIndex, error);
                }
            }
        }

        for (const request of requests) {
            if (!requestRequiresSourceArchive(request)) {
                continue;
            }
            const hasArchive = sourceArchives.has(request.generatorIndex);
            const hasError = errors.has(request.generatorIndex);
            if (hasArchive && hasError) {
                throw new Error(
                    `Generator index ${request.generatorIndex} produced both a source archive and a source preparation error`,
                    { cause: errors.get(request.generatorIndex) }
                );
            }
            if (!hasArchive && !hasError) {
                errors.set(
                    request.generatorIndex,
                    new Error(
                        `Generator index ${request.generatorIndex} did not produce a source archive or source preparation error`
                    )
                );
            }
        }
        return { sourceArchives, errors };
    };
}

interface PreparedSdkSources {
    sources: SdkSourceSpec[];
    /** How many definition-ordered specs the sources were prepared from. */
    sourceSpecCount: number;
}

/**
 * The SDK sources a generator on the SDK Config route uploads, in definition order: from-openapi protobuf
 * specs converted to OpenAPI (reusing the workspace's conversion when the generator selects its specs)
 * and docs-only protobuf specs dropped.
 */
async function prepareSdkSources({
    workspace,
    request,
    context
}: {
    workspace: SourceSpecExposingWorkspace;
    request: FernSourceArchiveRequest;
    context: TaskContext;
}): Promise<PreparedSdkSources> {
    const specsOverride = request.generatorInvocation.apiOverride?.specs;
    const convertAfresh: ConvertProtobufSpecs = (specs) => convertProtobufSpecs({ context, specs });
    const isOSSWorkspace = workspace instanceof OSSWorkspace;
    const specs = isOSSWorkspace
        ? await workspace.getSdkSourceSpecs(specsOverride)
        : await workspace.getAllSpecsForGenerator(specsOverride);
    const sources = await prepareSdkSourceSpecs({
        specs,
        convert:
            isOSSWorkspace && specsOverride == null
                ? () => workspace.getConvertedProtobufSpecsCached({ context })
                : convertAfresh,
        logger: context.logger
    });
    return { sources, sourceSpecCount: specs.length };
}

/**
 * Rewrites an explicit SDK Config document's `source.specs` to line up with the uploaded sources, when
 * preparation converted or dropped any. Synthesized SDK Config builds its sources from the archive.
 */
function getSdkConfigSourceSpecs({
    prepared,
    manifestEntries,
    specIndexes,
    sdkConfigV1,
    sdkConfigTargetIndex
}: {
    prepared: PreparedSdkSources;
    manifestEntries: RawSpecsManifestEntry[];
    specIndexes: number[];
    sdkConfigV1: FernSdkConfigV1Payload | undefined;
    sdkConfigTargetIndex: number | undefined;
}): SdkConfigV1SourceSpec[] | undefined {
    const { sources, sourceSpecCount } = prepared;
    const unchanged =
        sources.length === sourceSpecCount &&
        sources.every(({ protobuf, sourceIndex }, position) => protobuf == null && sourceIndex === position);
    if (sdkConfigV1 == null || unchanged) {
        return undefined;
    }
    const target = sdkConfigTargetIndex == null ? undefined : sdkConfigV1.targets[sdkConfigTargetIndex];
    if (target == null) {
        throw new Error(`SDK Config v1 does not contain target ${sdkConfigTargetIndex ?? "(none)"}`);
    }
    return rewriteSdkConfigSourceSpecs({
        configuredSpecs: getConfiguredSourceSpecs(target.body),
        sources,
        manifestEntries: specIndexes.map((index) => {
            const entry = manifestEntries[index];
            if (entry == null) {
                throw new Error(`Fern source manifest does not contain index ${index}`);
            }
            return entry;
        })
    });
}

function getConfiguredSourceSpecs(body: Buffer): SdkConfigV1SourceSpec[] {
    // The body was validated as an SdkConfigV1Document when sdk-config.yml was loaded.
    const document: { source?: { specs?: SdkConfigV1SourceSpec[] } } = JSON.parse(body.toString("utf8"));
    const specs = document.source?.specs;
    if (specs == null) {
        throw new Error("SDK Config v1 target payload has no source specs");
    }
    return specs;
}

function getClientPathParameterStyle(
    request: FernSourceArchiveRequest,
    sdkConfigV1: FernSdkConfigV1Payload | undefined
): "inline" | "wrapped" | "language-default" | undefined {
    if (request.sdkConfigTargetIndex == null) {
        return sdkConfigV1?.clientPathParameterStyle;
    }
    return (
        sdkConfigV1?.targets[request.sdkConfigTargetIndex]?.clientPathParameterStyle ??
        sdkConfigV1?.clientPathParameterStyle
    );
}

function fernDefinitionDeprecatedError(workspace: LazyFernWorkspace): CliError {
    return new CliError({
        message:
            `Workspace ${workspace.workspaceName ?? workspace.absoluteFilePath} uses a Fern Definition, which is deprecated ` +
            "and not supported for SDK generation through sdk-gen-api. sdk-gen-api generates from source specs " +
            "(OpenAPI, AsyncAPI, protobuf). Migrate the API to OpenAPI: run `fern export <output-path>` to export it, " +
            "then reference the exported spec under `api.specs` in generators.yml.",
        code: CliError.Code.ConfigError
    });
}

function requestRequiresSourceArchive(request: FernSourceArchiveRequest): boolean {
    return (
        request.sdkGenApiRoute != null ||
        generatorWantsSpecs(request.generatorInvocation.name, request.generatorInvocation.version)
    );
}
