import chalk from "chalk";

import { formatLog } from "@fern-api/cli-logger";
import { assertNever } from "@fern-api/core-utils";
import { LogLevel, Logger } from "@fern-api/logger";
import { NodePath } from "./NodePath";
import { ValidationViolation } from "./ValidationViolation";

export interface LogViolationsResponse {
    hasErrors: boolean;
}

export function logViolations({
    logger,
    violations,
    logWarnings,
    logSummary = true
}: {
    logger: Logger;
    violations: ValidationViolation[];
    logWarnings: boolean;
    logSummary?: boolean;
}): LogViolationsResponse {
    const stats = getViolationStats(violations);
    if (logSummary) {
        logViolationsSummary({ logger, stats, logWarnings });
    }

    const violationsByNodePath = groupViolationsByNodePath(violations);

    for (const [nodePath, violations] of violationsByNodePath) {
        const relativeFilepath = violations[0]?.relativeFilepath ?? "";
        logViolationsGroup({ logWarnings, relativeFilepath, nodePath, violations, logger });
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
    logger
}: {
    logWarnings: boolean;
    relativeFilepath: string;
    nodePath: NodePath;
    violations: ValidationViolation[];
    logger: Logger;
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
    logger.log(
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
    logger,
    logWarnings
}: {
    stats: ViolationStats;
    logger: Logger;
    logWarnings: boolean;
}): void {
    const { numFatal, numErrors, numWarnings } = stats;

    let message = `Found ${numFatal} errors and ${numErrors + numWarnings} warnings.`;
    if (!logWarnings && numWarnings > 0) {
        message += " Run fern check --warnings to print out the warnings not shown.";
    }

    if (numFatal > 0) {
        logger.error(message);
    } else if (numErrors + numWarnings > 0) {
        logger.warn(message);
    } else {
        logger.info(chalk.green("✓ All checks passed"));
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
