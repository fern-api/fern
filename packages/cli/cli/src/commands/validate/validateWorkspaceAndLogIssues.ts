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
    let violationsContainError = false;
    for (const violation of violations) {
        if (!violationsContainError && violation.severity === "error") {
            violationsContainError = true;
        }
        context.logger.log(
            getLogLevelForSeverity(violation.severity),
            formatLog({
                breadcrumbs: [
                    violation.relativeFilepath,
                    ...violation.nodePath.map((nodePathItem) => {
                        let itemStr = typeof nodePathItem === "string" ? nodePathItem : nodePathItem.key;
                        if (typeof nodePathItem !== "string" && nodePathItem.arrayIndex != null) {
                            itemStr += `[${nodePathItem.arrayIndex}]`;
                        }
                        return itemStr;
                    }),
                ],
                title: violation.message,
            })
        );
    }

    if (violationsContainError) {
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
