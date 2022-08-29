import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TASK_FAILURE } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function generateWorkspace({
    workspace,
    runLocal,
    keepDocker,
    organization,
    cliContext,
}: {
    workspace: Workspace;
    runLocal: boolean;
    keepDocker: boolean;
    organization: string;
    cliContext: CliContext;
}): Promise<void> {
    await cliContext.runTaskForWorkspace(workspace, async (context) => {
        const intermediateRepresentation = await generateIrForWorkspace({ workspace, context });
        if (intermediateRepresentation === TASK_FAILURE) {
            return;
        }
        if (runLocal) {
            await runLocalGenerationForWorkspace({
                organization,
                workspace,
                intermediateRepresentation,
                keepDocker,
            });
        } else {
            await runRemoteGenerationForWorkspace({
                workspace,
                intermediateRepresentation,
                organization,
                context,
                generatorConfigs: workspace.generatorsConfiguration.draft.map((generator) => ({
                    id: generator.name,
                    version: generator.version,
                    willDownloadFiles: generator.absolutePathToLocalOutput != null,
                    customConfig: generator.config,
                    outputs: {
                        npm: undefined,
                        maven: undefined,
                    },
                })),
                version: undefined,
            });
        }
    });
}
