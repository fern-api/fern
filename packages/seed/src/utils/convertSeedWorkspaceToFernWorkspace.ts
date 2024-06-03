import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { convertOpenApiWorkspaceToFernWorkspace, FernWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";

export async function convertGeneratorWorkspaceToFernWorkspace({
    fixture,
    absolutePathToAPIDefinition,
    taskContext,
    sdkLanguage
}: {
    fixture: string;
    absolutePathToAPIDefinition: AbsoluteFilePath;
    taskContext: TaskContext;
    sdkLanguage: generatorsYml.GenerationLanguage | undefined;
}): Promise<FernWorkspace | undefined> {
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: absolutePathToAPIDefinition,
        context: taskContext,
        cliVersion: "DUMMY",
        workspaceName: fixture,
        sdkLanguage
    });
    if (!workspace.didSucceed) {
        taskContext.logger.info(
            `Failed to load workspace. ${Object.entries(workspace.failures)
                .map(([file, reason]) => `${file}: ${reason.type}`)
                .join("\n")}`
        );
        return undefined;
    }
    return workspace.workspace.type === "fern"
        ? workspace.workspace
        : await convertOpenApiWorkspaceToFernWorkspace(workspace.workspace, taskContext, false, sdkLanguage);
}
