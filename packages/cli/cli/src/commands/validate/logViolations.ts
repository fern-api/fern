import chalk from "chalk";

import { formatLog } from "@fern-api/cli-logger";
import { assertNever } from "@fern-api/core-utils";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";

export interface LogViolationsResponse {
    hasErrors: boolean;
}

export function logViolations({
    context,
    violations,
    logWarnings,
    logSummary = true
}: {
    context: TaskContext;
    violations: ValidationViolation[];
    logWarnings: boolean;
    logSummary?: boolean;
}): LogViolationsResponse {
    const stats = getViolationStats(violations);
    if (logSummary) {
        logViolationsSummary({ context, stats, logWarnings });
    }

    violations.forEach((violation) => {
        if (violation.severity === "error") {
            logViolation({ violation, context });
        }
    });

    if (logWarnings) {
        violations.forEach((violation) => {
            if (violation.severity === "warning") {
                logViolation({ violation, context });
            }
        });
    }

    return {
        hasErrors: stats.numErrors > 0
    };
}

function logViolation({ violation, context }: { violation: ValidationViolation; context: TaskContext }): void {
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

function getLogLevelForSeverity(severity: "error" | "warning") {
    switch (severity) {
        case "error":
            return LogLevel.Error;
        case "warning":
            return LogLevel.Warn;
    }
}

function logViolationsSummary({
    stats,
    context,
    logWarnings
}: {
    stats: ViolationStats;
    context: TaskContext;
    logWarnings: boolean;
}): void {
    const { numErrors, numWarnings } = stats;

    let message = `Found ${numErrors} errors and ${numWarnings} warnings.`;
    if (!logWarnings) {
        message += " Run fern check --warnings to print out the warnings.";
    }

    if (numErrors > 0) {
        context.logger.error(message);
    } else if (numWarnings > 0) {
        context.logger.warn(message);
    } else {
        context.logger.info(chalk.green("✓ All checks passed"));
    }
}

interface ViolationStats {
    numErrors: number;
    numWarnings: number;
}

function getViolationStats(violations: ValidationViolation[]): ViolationStats {
    let numErrors = 0;
    let numWarnings = 0;
    for (const violation of violations) {
        switch (violation.severity) {
            case "error":
                numErrors += 1;
                continue;
            case "warning":
                numWarnings += 1;
                continue;
            default:
                assertNever(violation.severity);
        }
    }
    return {
        numErrors,
        numWarnings
    };
}
