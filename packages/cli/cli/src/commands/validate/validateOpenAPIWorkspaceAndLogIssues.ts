import { LogLevel } from "@fern-api/logger";
import { validateOpenAPIWorkspace } from "@fern-api/openapi-transformer";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import path from "path";

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
        const pathToOpenApi = path.join(workspace.absolutePathToDefinition, workspace.definition.path);
        context.logger.log(
            getLogLevelForSeverity(violation.severity),
            formatLog({
                title: violation.message,
                location: {
                    path: path.relative(process.cwd(), pathToOpenApi),
                    line: violation.line,
                    column: violation.column,
                },
                breadcrumbs:
                    violation.breadcrumbs.length > 5
                        ? [...violation.breadcrumbs.slice(0, 5), "..."]
                        : violation.breadcrumbs,
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

interface FormatLogArgs {
    breadcrumbs: string[];
    title: string;
    location: Location;
}

interface Location {
    path: string;
    line: number;
    column: number;
}

function formatLog({ title, location, breadcrumbs = [] }: FormatLogArgs): string {
    const lines: string[] = [];
    lines.push(chalk.cyan(location.path) + ":" + chalk.yellow(`${location.line}:${location.column}`));
    if (breadcrumbs.length > 0) {
        lines.push(chalk.dim(breadcrumbs.join(" -> ")));
    }
    lines.push(title);
    return lines.join("\n");
}
