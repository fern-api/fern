import { TaskContext } from "@fern-api/task-context";
import { validateWorkspace } from "@fern-api/validator";
import { Workspace } from "@fern-api/workspace-loader";
import validatePackageName from "validate-npm-package-name";
import { logIssueInYaml } from "../../utils/logIssueInYaml";

export async function validateWorkspaceAndLogIssues(workspace: Workspace, context: TaskContext): Promise<void> {
    if (!validatePackageName(workspace.name).validForNewPackages) {
        context.logger.error("Workspace name is not valid.");
        context.fail();
    }

    const violations = await validateWorkspace(workspace, context);
    for (const violation of violations) {
        logIssueInYaml({
            severity: violation.severity,
            relativeFilePath: violation.relativeFilePath,
            breadcrumbs: violation.nodePath,
            title: violation.message,
            logger: context.logger,
        });
    }
}
