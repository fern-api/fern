import { generatorsYml } from "@fern-api/configuration-loader";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import {
    createGroupedSpecsTarGzArchiveSettled,
    createSpecsTarGzArchive,
    generatorWantsSpecs,
    validateSdkConfigImportSettings
} from "@fern-api/local-workspace-runner";
import { type FernSourceArchiveRequest, type FernSourceArchiveResolution } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

export function createFernSourceArchiveResolver({
    workspace,
    context,
    group
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    context: TaskContext;
    group: generatorsYml.GeneratorGroup;
}): (requests: FernSourceArchiveRequest[]) => Promise<FernSourceArchiveResolution> {
    return async (requests) => {
        const sourceArchives: FernSourceArchiveResolution["sourceArchives"] = new Map();
        const errors = new Map<number, unknown>();
        if (!(workspace instanceof OSSWorkspace)) {
            return { sourceArchives, errors };
        }

        const settledSelections = await Promise.allSettled(
            requests.map(async (request) => {
                if (request.sdkGenApiRoute == null) {
                    return undefined;
                }
                const specs = await workspace.getAllSpecsForGenerator(request.generatorInvocation.apiOverride?.specs);
                if (request.sdkGenApiRoute.payloadKind === "sdk-config-v1") {
                    validateSdkConfigImportSettings(specs);
                }
                return specs;
            })
        );
        const generatorSelections = settledSelections.flatMap((result, index) => {
            const request = requests[index];
            if (request == null) {
                throw new Error(`Missing source archive request at settled index ${index}`);
            }
            if (result.status === "rejected") {
                errors.set(request.generatorIndex, result.reason);
                return [];
            }
            return result.value == null ? [] : [{ generatorIndex: request.generatorIndex, specs: result.value }];
        });
        if (generatorSelections.length > 0) {
            const settledArchive = await createGroupedSpecsTarGzArchiveSettled({
                generatorSelections,
                context,
                audiences: group.audiences
            });
            for (const [generatorIndex, error] of settledArchive.errorsByGeneratorIndex) {
                errors.set(generatorIndex, error);
            }
            if (settledArchive.archive != null) {
                const { specIndexesByGeneratorIndex, ...sourceArchive } = settledArchive.archive;
                for (const [generatorIndex, specIndexes] of specIndexesByGeneratorIndex) {
                    sourceArchives.set(generatorIndex, { ...sourceArchive, specIndexes });
                }
            }
        }

        const rootRequests = requests.filter(
            (request) =>
                request.sdkGenApiRoute == null &&
                generatorWantsSpecs(request.generatorInvocation.name) &&
                !errors.has(request.generatorIndex)
        );
        if (rootRequests.length > 0) {
            try {
                const archive = await createSpecsTarGzArchive({
                    specs: workspace.allSpecs,
                    context,
                    audiences: group.audiences
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
            const requiresSourceArchive =
                request.sdkGenApiRoute != null || generatorWantsSpecs(request.generatorInvocation.name);
            if (!requiresSourceArchive) {
                continue;
            }
            const hasArchive = sourceArchives.has(request.generatorIndex);
            const hasError = errors.has(request.generatorIndex);
            if (hasArchive === hasError) {
                const cause = errors.get(request.generatorIndex);
                sourceArchives.delete(request.generatorIndex);
                errors.set(
                    request.generatorIndex,
                    new Error(
                        `Generator index ${request.generatorIndex} must have exactly one source archive or source preparation error outcome`,
                        hasError ? { cause } : undefined
                    )
                );
            }
        }
        return { sourceArchives, errors };
    };
}
