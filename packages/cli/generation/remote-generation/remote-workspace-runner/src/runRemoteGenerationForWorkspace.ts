import { assertNever } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { Fiddle } from "@fern-fern/fiddle-client-v2";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { createAndStartJob } from "./createAndStartJob";
import { GenerationLevel } from "./GenerationLevel";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspace,
    intermediateRepresentation,
    context,
    generationLevel,
}: {
    organization: string;
    workspace: Workspace;
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    generationLevel: GenerationLevel;
}): Promise<void> {
    const generatorConfigs = getGeneratorConfigs({ generationLevel, workspace });
    if (generatorConfigs.length === 0) {
        context.logger.warn("No generators specified.");
        return;
    }

    let job: Fiddle.remoteGen.CreateJobResponse;
    try {
        job = await createAndStartJob({ workspace, organization, intermediateRepresentation, generatorConfigs });
    } catch (error) {
        context.fail("Failed to create job", error);
        return;
    }

    await pollJobAndReportStatus({
        job,
        workspace,
        context,
    });
}

function getGeneratorConfigs({
    generationLevel,
    workspace,
}: {
    generationLevel: GenerationLevel;
    workspace: Workspace;
}): Fiddle.remoteGen.GeneratorConfig[] {
    switch (generationLevel) {
        case GenerationLevel.Draft:
            return workspace.generatorsConfiguration.draft.map((generator) => ({
                id: generator.name,
                version: generator.version,
                willDownloadFiles: generator.absolutePathToLocalOutput != null,
                customConfig: generator.config,
            }));
        case GenerationLevel.Release:
            return workspace.generatorsConfiguration.release.map((generator) => ({
                id: generator.name,
                version: generator.version,
                willDownloadFiles: false,
                customConfig: generator.config,
            }));
        default:
            assertNever(generationLevel);
    }
}
