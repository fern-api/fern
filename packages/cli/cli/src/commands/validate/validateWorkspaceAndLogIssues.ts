import { TaskContext, TaskResult } from "@fern-api/task-context";
import { validateWorkspace } from "@fern-api/validator";
import { Workspace } from "@fern-api/workspace-loader";
import { logIssueInYaml } from "../../utils/logIssueInYaml";

export async function validateWorkspaceAndLogIssues(workspace: Workspace, task: TaskContext): Promise<TaskResult> {
    const violations = await validateWorkspace(workspace);
    if (violations.length === 0) {
        return TaskResult.Success;
    }

    for (const violation of violations) {
        logIssueInYaml({
            severity: violation.severity,
            relativeFilePath: violation.relativeFilePath,
            breadcrumbs: violation.nodePath,
            title: violation.message,
            logger: task.logger,
        });
    }

    return TaskResult.Failure;
}
