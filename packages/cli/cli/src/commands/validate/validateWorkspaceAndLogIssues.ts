import { formatLog, LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { validateWorkspace } from "@fern-api/validator";
import { Workspace } from "@fern-api/workspace-loader";
import validatePackageName from "validate-npm-package-name";

export async function validateWorkspaceAndLogIssues(workspace: Workspace, context: TaskContext): Promise<void> {
    if (!validatePackageName(workspace.name).validForNewPackages) {
        context.failAndThrow("Workspace name is not valid.");
    }

    const violations = await validateWorkspace(workspace, context.logger);

    for (const violation of violations) {
        context.logger.log(
            getLogLevelForSeverity(violation.severity),
            formatLog({
                breadcrumbs: [violation.relativeFilepath, ...violation.nodePath],
                title: violation.message,
            })
        );
    }

    if (violations.length > 0) {
        context.failAndThrow();
    }
}

function getLogLevelForSeverity(severity: "error" | "warning") {
    switch (severity) {
        case "error":
            return LogLevel.Error;
        case "warning":
            return LogLevel.Warn;
    }
}
