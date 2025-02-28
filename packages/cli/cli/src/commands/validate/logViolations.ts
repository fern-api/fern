import chalk from "chalk";
import { V } from "vitest/dist/chunks/reporters.nr4dxCkA";

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
    logSummary = true,
    logBreadcrumbs = true,
    elapsedMillis = 0
}: {
    context: TaskContext;
    violations: ValidationViolation[];
    logWarnings: boolean;
    logSummary?: boolean;
    logBreadcrumbs?: boolean;
    elapsedMillis?: number;
}): LogViolationsResponse {
    const stats = getViolationStats(violations);
    const violationsByNodePath = groupViolationsByNodePath(violations);

    // log the violations in sorted order so that output across runs is easier
    // to compare and ete test snapshots work
    for (const nodePath of Array.from(violationsByNodePath.keys()).sort()) {
        const violations = violationsByNodePath.get(nodePath);
        if (violations) {
            const configRelativeFilepath = violations[0]?.relativeFilepath ?? "";
            logViolationsGroup({ logWarnings, logBreadcrumbs, configRelativeFilepath, nodePath, violations, context });
        }
    }

    // log the summary at the end so that it's not pushed out of view by the violations
    if (logSummary) {
        logViolationsSummary({ context, stats, logWarnings, elapsedMillis });
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
    logBreadcrumbs,
    configRelativeFilepath,
    nodePath,
    violations,
    context
}: {
    logWarnings: boolean;
    logBreadcrumbs: boolean;
    configRelativeFilepath: string;
    nodePath: NodePath;
    violations: ValidationViolation[];
    context: TaskContext;
}): void {
    const severity = getSeverityForViolations(violations);
    if (severity === "warning" && !logWarnings) {
        return;
    }
    let title = "";
    const violationMessages = violations
        .map((violation) => {
            if (violation.severity === "warning" && !logWarnings) {
                return null;
            }
            if (title === "") {
                title = violation.relativeFilepath;
            }
            return violation.message;
        })
        .filter((message): message is string => message != null)
        .join("\n");
    context.logger.log(
        getLogLevelForSeverity(severity),
        formatLog({
            breadcrumbs: logBreadcrumbs
                ? [
                      configRelativeFilepath,
                      ...nodePath.map((nodePathItem) => {
                          let itemStr = typeof nodePathItem === "string" ? nodePathItem : nodePathItem.key;
                          if (typeof nodePathItem !== "string" && nodePathItem.arrayIndex != null) {
                              itemStr += `[${nodePathItem.arrayIndex}]`;
                          }
                          return itemStr;
                      })
                  ]
                : [],
            title,
            subtitle: violationMessages
        }) + "\n" // empty line to separate each group
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
            return LogLevel.Error;
        case "warning":
            return LogLevel.Warn;
        default:
            assertNever(severity);
    }
}

function logViolationsSummary({
    stats,
    context,
    logWarnings,
    elapsedMillis = 0
}: {
    stats: ViolationStats;
    context: TaskContext;
    logWarnings: boolean;
    elapsedMillis?: number;
}): void {
    const { numFatal, numErrors, numWarnings } = stats;

    const suffix = elapsedMillis > 0 ? ` in ${(elapsedMillis / 1000).toFixed(3)} seconds.` : ".";
    let message = `Found ${numFatal + numErrors} errors and ${numWarnings} warnings` + suffix;
    if (!logWarnings && numWarnings > 0) {
        message += " Run fern check --warnings to print out the warnings not shown.";
    }

    if (numFatal + numErrors > 0) {
        context.logger.error(message);
    } else if (numWarnings > 0) {
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
