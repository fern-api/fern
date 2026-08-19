import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";

export async function convertGeneratorWorkspaceToFernWorkspace({
    fixture,
    absolutePathToAPIDefinition,
    taskContext,
    workspaceName,
    cliVersion,
    lenient
}: {
    fixture: string;
    absolutePathToAPIDefinition: AbsoluteFilePath;
    taskContext: TaskContext;
    /** Override workspace name (defaults to fixture name) */
    workspaceName?: string;
    /** Override CLI version (defaults to "DUMMY") */
    cliVersion?: string;
    /** If true, use lenient parsing for generators config (tolerates unrecognized keys) */
    lenient?: boolean;
}): Promise<AbstractAPIWorkspace<unknown> | undefined> {
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: absolutePathToAPIDefinition,
        context: taskContext,
        cliVersion: cliVersion ?? "DUMMY",
        workspaceName: workspaceName ?? fixture,
        lenient
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
