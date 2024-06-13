import { Audiences, generatorsYml } from "@fern-api/configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import {
    migrateIntermediateRepresentationForGenerator,
    migrateIntermediateRepresentationThroughVersion
} from "@fern-api/ir-migrations";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";

export async function getIntermediateRepresentation({
    workspace,
    audiences,
    generatorInvocation,
    context,
    irVersionOverride
}: {
    workspace: FernWorkspace;
    audiences: Audiences;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    context: TaskContext;
    irVersionOverride: string | undefined;
}): Promise<unknown> {
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace,
        audiences,
        generationLanguage: generatorInvocation.language,
        keywords: generatorInvocation.keywords,
        smartCasing: generatorInvocation.smartCasing,
        disableExamples: generatorInvocation.disableExamples,
        readme: generatorInvocation.readme
    });
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
    return migratedIntermediateRepresentation;
}
