import { assertNever } from "@fern-api/core-utils";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

export interface ApiValidationResult {
    apiName: string;
    violations: ValidationViolation[];
    elapsedMillis: number;
}

export interface DocsValidationResult {
    violations: ValidationViolation[];
    elapsedMillis: number;
}

export interface CheckReportInput {
    apiResults: ApiValidationResult[];
    docsResult: DocsValidationResult | undefined;
    logWarnings: boolean;
    context: TaskContext;
}

interface ViolationStats {
    numErrors: number;
    numWarnings: number;
}

export function printCheckReport({ apiResults, docsResult, logWarnings, context }: CheckReportInput): {
    hasErrors: boolean;
} {
    const startTime = performance.now();
    let hasErrors = false;

    // Print SDK section if there are any API results with violations
    const apiResultsWithViolations = apiResults.filter((result) => {
        const stats = getViolationStats(result.violations);
        return stats.numErrors > 0 || (logWarnings && stats.numWarnings > 0);
    });

    if (apiResultsWithViolations.length > 0) {
        const totalSdkStats = getTotalStats(apiResults.map((r) => r.violations).flat());
        const showApiNesting = apiResults.length > 1;

        if (showApiNesting) {
            // Multiple APIs - show [sdk] header with nested [api] sections
            context.logger.info(chalk.cyan(chalk.bold("[sdk]")));
            for (const apiResult of apiResults) {
                const stats = getViolationStats(apiResult.violations);
                if (stats.numErrors > 0 || (logWarnings && stats.numWarnings > 0)) {
                    hasErrors = hasErrors || stats.numErrors > 0;
                    printApiSection({
                        apiName: apiResult.apiName,
                        violations: apiResult.violations,
                        stats,
                        logWarnings,
                        context,
                        indent: "    "
                    });
                }
            }
        } else {
            // Single API - show [sdk] header with violations directly
            hasErrors = hasErrors || totalSdkStats.numErrors > 0;
            printSdkSectionFlat({
                violations: apiResults[0]?.violations ?? [],
                stats: totalSdkStats,
                logWarnings,
                context
            });
        }
    }

    // Print docs section if there are docs violations
    if (docsResult != null) {
        const docsStats = getViolationStats(docsResult.violations);
        if (docsStats.numErrors > 0 || (logWarnings && docsStats.numWarnings > 0)) {
            hasErrors = hasErrors || docsStats.numErrors > 0;
            printDocsSection({
                violations: docsResult.violations,
                stats: docsStats,
                logWarnings,
                context
            });
        }
    }

    // Print summary
    const totalElapsedMillis = performance.now() - startTime;
    const allViolations = [...apiResults.map((r) => r.violations).flat(), ...(docsResult?.violations ?? [])];
    const totalStats = getViolationStats(allViolations);

    printSummary({
        stats: totalStats,
        logWarnings,
        elapsedMillis: totalElapsedMillis,
        context
    });

    return { hasErrors };
}

function printSdkSectionFlat({
    violations,
    stats,
    logWarnings,
    context
}: {
    violations: ValidationViolation[];
    stats: ViolationStats;
    logWarnings: boolean;
    context: TaskContext;
}): void {
    const statsStr = formatStats(stats, logWarnings);
    context.logger.info(chalk.cyan(chalk.bold(`[sdk]`)) + ` ${statsStr}`);

    printViolationsByType({
        violations,
        logWarnings,
        context,
        indent: "    "
    });
}

function printApiSection({
    apiName,
    violations,
    stats,
    logWarnings,
    context,
    indent
}: {
    apiName: string;
    violations: ValidationViolation[];
    stats: ViolationStats;
    logWarnings: boolean;
    context: TaskContext;
    indent: string;
}): void {
    const statsStr = formatStats(stats, logWarnings);
    context.logger.info(`${indent}${chalk.bold(`[${apiName}]`)} ${statsStr}`);

    printViolationsByType({
        violations,
        logWarnings,
        context,
        indent: indent + "    "
    });
}

function printDocsSection({
    violations,
    stats,
    logWarnings,
    context
}: {
    violations: ValidationViolation[];
    stats: ViolationStats;
    logWarnings: boolean;
    context: TaskContext;
}): void {
    const statsStr = formatStats(stats, logWarnings);
    context.logger.info(chalk.magenta(chalk.bold(`[docs]`)) + ` ${statsStr}`);

    printViolationsByType({
        violations,
        logWarnings,
        context,
        indent: "    "
    });
}

function printViolationsByType({
    violations,
    logWarnings,
    context,
    indent
}: {
    violations: ValidationViolation[];
    logWarnings: boolean;
    context: TaskContext;
    indent: string;
}): void {
    // Group violations by severity
    const errors = violations.filter((v) => v.severity === "fatal" || v.severity === "error");
    const warnings = violations.filter((v) => v.severity === "warning");

    // Print warnings first (if enabled)
    if (logWarnings) {
        for (const violation of warnings.sort(sortViolations)) {
            printViolation({ violation, context, indent });
        }
    }

    // Print errors at the end
    for (const violation of errors.sort(sortViolations)) {
        printViolation({ violation, context, indent });
    }
}

function printViolation({
    violation,
    context,
    indent
}: {
    violation: ValidationViolation;
    context: TaskContext;
    indent: string;
}): void {
    const severityLabel = getSeverityLabel(violation.severity);
    const path = formatViolationPath(violation);

    // If path is empty, print issue on same line as severity label
    if (path === "") {
        context.logger.info(`${indent}${severityLabel} ${violation.message}`);
    } else {
        context.logger.info(`${indent}${severityLabel}`);
        context.logger.info(`${indent}    path: ${chalk.blue(path)}`);
        context.logger.info(`${indent}    issue: ${violation.message}`);
    }
    // Add blank line after each violation for better readability
    context.logger.info("");
}

function formatViolationPath(violation: ValidationViolation): string {
    const parts: string[] = [];

    // Only add relativeFilepath if it's not empty
    if (violation.relativeFilepath !== "") {
        parts.push(violation.relativeFilepath);
    }

    for (const nodePathItem of violation.nodePath) {
        let itemStr = typeof nodePathItem === "string" ? nodePathItem : nodePathItem.key;
        if (typeof nodePathItem !== "string" && nodePathItem.arrayIndex != null) {
            itemStr += `[${nodePathItem.arrayIndex}]`;
        }
        parts.push(itemStr);
    }

    return parts.join(" -> ");
}

function getSeverityLabel(severity: ValidationViolation["severity"]): string {
    switch (severity) {
        case "fatal":
            return chalk.red("[error]");
        case "error":
            return chalk.red("[error]");
        case "warning":
            return chalk.yellow("[warning]");
        default:
            assertNever(severity);
    }
}

function formatStats(stats: ViolationStats, logWarnings: boolean): string {
    const parts: string[] = [];
    if (stats.numErrors > 0) {
        parts.push(`${stats.numErrors} error${stats.numErrors !== 1 ? "s" : ""}`);
    }
    if (logWarnings && stats.numWarnings > 0) {
        parts.push(`${stats.numWarnings} warning${stats.numWarnings !== 1 ? "s" : ""}`);
    }
    return parts.join(", ");
}

function getViolationStats(violations: ValidationViolation[]): ViolationStats {
    let numErrors = 0;
    let numWarnings = 0;
    for (const violation of violations) {
        switch (violation.severity) {
            case "fatal":
            case "error":
                numErrors += 1;
                break;
            case "warning":
                numWarnings += 1;
                break;
            default:
                assertNever(violation.severity);
        }
    }
    return { numErrors, numWarnings };
}

function getTotalStats(violations: ValidationViolation[]): ViolationStats {
    return getViolationStats(violations);
}

function sortViolations(a: ValidationViolation, b: ValidationViolation): number {
    // Sort by filepath first, then by nodePath
    const pathCompare = a.relativeFilepath.localeCompare(b.relativeFilepath);
    if (pathCompare !== 0) {
        return pathCompare;
    }
    return JSON.stringify(a.nodePath).localeCompare(JSON.stringify(b.nodePath));
}

function printSummary({
    stats,
    logWarnings,
    elapsedMillis,
    context
}: {
    stats: ViolationStats;
    logWarnings: boolean;
    elapsedMillis: number;
    context: TaskContext;
}): void {
    const suffix = elapsedMillis > 0 ? ` in ${(elapsedMillis / 1000).toFixed(3)} seconds.` : ".";
    let message =
        `Found ${stats.numErrors} error${stats.numErrors !== 1 ? "s" : ""} and ${stats.numWarnings} warning${stats.numWarnings !== 1 ? "s" : ""}` +
        suffix;
    if (!logWarnings && stats.numWarnings > 0) {
        message += " Run fern check --warnings to print out the warnings not shown.";
    }

    if (stats.numErrors > 0) {
        context.logger.error(message);
    } else if (stats.numWarnings > 0) {
        context.logger.warn(message);
    } else {
        context.logger.info(chalk.green("All checks passed"));
    }
}
