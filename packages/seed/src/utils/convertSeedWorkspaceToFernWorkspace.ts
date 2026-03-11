import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";

export async function convertGeneratorWorkspaceToFernWorkspace({
    fixture,
    absolutePathToAPIDefinition,
    taskContext,
    workspaceName,
    cliVersion
}: {
    fixture: string;
    absolutePathToAPIDefinition: AbsoluteFilePath;
    taskContext: TaskContext;
    /** Override workspace name (defaults to fixture name) */
    workspaceName?: string;
    /** Override CLI version (defaults to "DUMMY") */
    cliVersion?: string;
}): Promise<AbstractAPIWorkspace<unknown> | undefined> {
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: absolutePathToAPIDefinition,
        context: taskContext,
        cliVersion: cliVersion ?? "DUMMY",
        workspaceName: workspaceName ?? fixture
    });
    if (!workspace.didSucceed) {
        taskContext.logger.info(
            `Failed to load workspace. ${Object.entries(workspace.failures)
                .map(([file, reason]) => `${file}: ${reason.type}`)
                .join("\n")}`
        );
        return undefined;
    }
    return workspace.workspace;
}
