import {
    detectCiProvider,
    detectInvocationSource,
    FernWorkspace,
    getOriginGitCommit,
    getOriginGitCommitIsDirty
} from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { getIrVersionForGenerator } from "@fern-api/core";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import {
    migrateIntermediateRepresentationForGenerator,
    migrateIntermediateRepresentationThroughVersion
} from "@fern-api/ir-migrations";
import { IntermediateRepresentation, SourceConfig } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

export declare namespace getIntermediateRepresentation {
    interface Return {
        latest: IntermediateRepresentation;
        migrated: unknown;
    }
}

export async function getIntermediateRepresentation({
    workspace,
    audiences,
    generatorInvocation,
    context,
    irVersionOverride,
    version,
    packageName,
    sourceConfig,
    includeOptionalRequestPropertyExamples,
    ir
}: {
    workspace: FernWorkspace;
    audiences: Audiences;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    context: TaskContext;
    irVersionOverride: string | undefined;
    version: string | undefined;
    packageName: string | undefined;
    sourceConfig: SourceConfig | undefined;
    includeOptionalRequestPropertyExamples?: boolean;
    ir?: IntermediateRepresentation;
}): Promise<getIntermediateRepresentation.Return> {
    const intermediateRepresentation =
        ir ??
        generateIntermediateRepresentation({
            workspace,
            audiences,
            generationLanguage: generatorInvocation.language,
            keywords: generatorInvocation.keywords,
            smartCasing: generatorInvocation.smartCasing,
            exampleGeneration: {
                includeOptionalRequestPropertyExamples,
                disabled: generatorInvocation.disableExamples
            },
            readme: generatorInvocation.readme,
            version,
            packageName,
            context,
            sourceResolver: new SourceResolverImpl(context, workspace),
            generationMetadata: {
                cliVersion: workspace.cliVersion,
                generatorName: generatorInvocation.name,
                generatorVersion: generatorInvocation.version,
                generatorConfig: generatorInvocation.config,
                originGitCommit: getOriginGitCommit(),
                originGitCommitIsDirty: getOriginGitCommitIsDirty(),
                invokedBy: detectInvocationSource(),
                requestedVersion: version,
                ciProvider: detectCiProvider()
            }
        });
    if (sourceConfig != null) {
        intermediateRepresentation.sourceConfig = sourceConfig;
    }
    intermediateRepresentation.generationMetadata = {
        cliVersion: workspace.cliVersion,
        generatorName: generatorInvocation.name,
        generatorVersion: generatorInvocation.version,
        generatorConfig: generatorInvocation.config,
        originGitCommit: getOriginGitCommit(),
        originGitCommitIsDirty: getOriginGitCommitIsDirty(),
        invokedBy: detectInvocationSource(),
        // `requestedVersion` must reflect the raw `--version` flag passed by the user. The
        // `version` parameter here may have been resolved (e.g. via `computeSemanticVersion`)
        // so we never fall back to it. When the IR is freshly generated above, this field is
        // populated with the raw flag value. When the IR is pre-generated, the caller is
        // responsible for having set this correctly; a pre-existing `undefined` means the
        // user did not pass `--version`.
        requestedVersion: intermediateRepresentation.generationMetadata?.requestedVersion,
        ciProvider: detectCiProvider()
    };

    context.logger.debug("Generated IR");
    const irVersionFromFdr = await getIrVersionForGenerator(generatorInvocation).then((version) =>
        version == null ? undefined : "v" + version.toString()
    );
    const resolvedIrVersionOverride = irVersionOverride ?? irVersionFromFdr;
    const migratedIntermediateRepresentation =
        resolvedIrVersionOverride != null
            ? await migrateIntermediateRepresentationThroughVersion({
                  intermediateRepresentation,
                  context,
                  version: resolvedIrVersionOverride
              })
            : await migrateIntermediateRepresentationForGenerator({
                  intermediateRepresentation,
                  context,
                  targetGenerator: {
                      name: generatorInvocation.name,
                      version: generatorInvocation.version
                  }
              });
    return {
        latest: intermediateRepresentation,
        migrated: migratedIntermediateRepresentation
    };
}
