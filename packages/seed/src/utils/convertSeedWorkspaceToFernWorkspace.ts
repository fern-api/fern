import { AbsoluteFilePath } from "@fern-api/fs-utils"
import { TaskContext } from "@fern-api/task-context"
import { AbstractAPIWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader"

export async function convertGeneratorWorkspaceToFernWorkspace({
    fixture,
    absolutePathToAPIDefinition,
    taskContext
}: {
    fixture: string
    absolutePathToAPIDefinition: AbsoluteFilePath
    taskContext: TaskContext
}): Promise<AbstractAPIWorkspace<unknown> | undefined> {
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: absolutePathToAPIDefinition,
        context: taskContext,
        cliVersion: "DUMMY",
        workspaceName: fixture
    })
    if (!workspace.didSucceed) {
        taskContext.logger.info(
            `Failed to load workspace. ${Object.entries(workspace.failures)
                .map(([file, reason]) => `${file}: ${reason.type}`)
                .join("\n")}`
        )
        return undefined
    }
    return workspace.workspace
}
