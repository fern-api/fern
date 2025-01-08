import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences, generatorsYml } from "@fern-api/configuration";
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
    includeOptionalRequestPropertyExamples
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
}): Promise<getIntermediateRepresentation.Return> {
    const intermediateRepresentation = generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: generatorInvocation.language,
        keywords: generatorInvocation.keywords,
        smartCasing: generatorInvocation.smartCasing,
        includeOptionalRequestPropertyExamples,
        disableExamples: generatorInvocation.disableExamples,
        readme: generatorInvocation.readme,
        version,
        packageName,
        context,
        sourceResolver: new SourceResolverImpl(context, workspace)
    });
    if (sourceConfig != null) {
        intermediateRepresentation.sourceConfig = sourceConfig;
    }
    context.logger.debug("Generated IR");
    const migratedIntermediateRepresentation =
        irVersionOverride != null
            ? await migrateIntermediateRepresentationThroughVersion({
                  intermediateRepresentation,
                  context,
                  version: irVersionOverride
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
