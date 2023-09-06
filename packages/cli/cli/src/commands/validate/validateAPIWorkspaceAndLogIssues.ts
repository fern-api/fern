import { formatLog, LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { validateFernWorkspace } from "@fern-api/validator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import validatePackageName from "validate-npm-package-name";

export async function validateAPIWorkspaceAndLogIssues(workspace: FernWorkspace, context: TaskContext): Promise<void> {
    if (!validatePackageName(workspace.name).validForNewPackages) {
        context.failAndThrow("Workspace name is not valid.");
    }

    const violations = await validateFernWorkspace(workspace, context.logger);
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
