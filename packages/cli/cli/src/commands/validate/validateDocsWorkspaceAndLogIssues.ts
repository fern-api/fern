import { validateDocsWorkspace } from "@fern-api/docs-validator";
import { formatLog, LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";

export async function validateDocsWorkspaceAndLogIssues(workspace: DocsWorkspace, context: TaskContext): Promise<void> {
    const violations = await validateDocsWorkspace(workspace, context.logger);
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
                    })
                ],
                title: violation.message
            })
        );
    }

    if (violationsContainError) {
        context.failAndThrow();
    } else {
        context.logger.info(chalk.green("✓ All checks passed"));
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
