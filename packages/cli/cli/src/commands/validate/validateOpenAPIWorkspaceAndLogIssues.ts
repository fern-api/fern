import { formatLog, LogLevel } from "@fern-api/logger";
import { validateOpenAPIWorkspace } from "@fern-api/openapi-transformer";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIWorkspace } from "@fern-api/workspace-loader";

export async function validateOpenAPIWorkspaceAndLogIssues(
    workspace: OpenAPIWorkspace,
    context: TaskContext
): Promise<void> {
    const violations = await validateOpenAPIWorkspace(workspace);
    let violationsContainError = false;
    for (const violation of violations) {
        if (!violationsContainError && violation.severity === "error") {
            violationsContainError = true;
        }
        context.logger.log(
            getLogLevelForSeverity(violation.severity),
            formatLog({
                breadcrumbs: [workspace.definition.path, ...violation.breadcrumbs],
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
