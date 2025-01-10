import chalk from "chalk";

import { formatLog } from "@fern-api/cli-logger";
import { assertNever } from "@fern-api/core-utils";
import { NodePath } from "@fern-api/fern-definition-schema";
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

    const violationsByNodePath = groupViolationsByNodePath(violations);

    for (const [nodePath, violations] of violationsByNodePath) {
        const relativeFilepath = violations[0]?.relativeFilepath ?? "";
        logViolationsGroup({ logWarnings, relativeFilepath, nodePath, violations, context });
    }

    return {
        hasErrors: stats.numFatal > 0
    };
}

function groupViolationsByNodePath(violations: ValidationViolation[]): Map<NodePath, ValidationViolation[]> {
    const map = new Map<NodePath, ValidationViolation[]>();
    for (const violation of violations) {
        map.set(violation.nodePath, [...(map.get(violation.nodePath) ?? []), violation]);
    }
    return map;
}

function logViolationsGroup({
    logWarnings,
    relativeFilepath,
    nodePath,
    violations,
    context
}: {
    logWarnings: boolean;
    relativeFilepath: string;
    nodePath: NodePath;
    violations: ValidationViolation[];
    context: TaskContext;
}): void {
    const severity = getSeverityForViolations(violations);
    if (severity === "warning" && !logWarnings) {
        return;
    }
    const violationMessages = violations
        .map((violation) => {
            if (violation.severity === "warning" && !logWarnings) {
                return null;
            }
            return violation.message;
        })
        .filter((message): message is string => message != null)
        .join("\n");
    context.logger.log(
        getLogLevelForSeverity(severity),
        formatLog({
            breadcrumbs: [
                relativeFilepath,
                ...nodePath.map((nodePathItem) => {
                    let itemStr = typeof nodePathItem === "string" ? nodePathItem : nodePathItem.key;
                    if (typeof nodePathItem !== "string" && nodePathItem.arrayIndex != null) {
                        itemStr += `[${nodePathItem.arrayIndex}]`;
                    }
                    return itemStr;
                })
            ],
            title: violationMessages
        })
    );
}

function getSeverityForViolations(violations: ValidationViolation[]): ValidationViolation["severity"] {
    return violations.some((violation) => violation.severity === "fatal")
        ? "fatal"
        : violations.some((violation) => violation.severity === "error")
          ? "error"
          : "warning";
}

function getLogLevelForSeverity(severity: ValidationViolation["severity"]) {
    switch (severity) {
        case "fatal":
            return LogLevel.Error;
        case "error":
            return LogLevel.Warn;
        case "warning":
            return LogLevel.Warn;
        default:
            assertNever(severity);
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
    const { numFatal, numErrors, numWarnings } = stats;

    let message = `Found ${numFatal} errors and ${numErrors + numWarnings} warnings.`;
    if (!logWarnings && numWarnings > 0) {
        message += " Run fern check --warnings to print out the warnings not shown.";
    }

    if (numFatal > 0) {
        context.logger.error(message);
    } else if (numErrors + numWarnings > 0) {
        context.logger.warn(message);
    } else {
        context.logger.info(chalk.green("✓ All checks passed"));
    }
}

interface ViolationStats {
    numFatal: number;
    numErrors: number;
    numWarnings: number;
}

function getViolationStats(violations: ValidationViolation[]): ViolationStats {
    let numFatal = 0;
    let numErrors = 0;
    let numWarnings = 0;
    for (const violation of violations) {
        switch (violation.severity) {
            case "fatal":
                numFatal += 1;
                continue;
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
        numFatal,
        numErrors,
        numWarnings
    };
}
