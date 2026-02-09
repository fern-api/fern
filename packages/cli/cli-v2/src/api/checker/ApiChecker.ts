import { assertNever } from "@fern-api/core-utils";
import type { NodePath } from "@fern-api/fern-definition-schema";
import type { ValidationViolation } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, join, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import chalk from "chalk";
import type { Context } from "../../context/Context.js";
import { Colors, formatMessage, Icons } from "../../ui/format.js";
import { Task } from "../../ui/Task.js";
import type { Workspace } from "../../workspace/Workspace.js";
import type { ApiSpecType } from "../config/ApiSpec.js";
import { isFernSpec } from "../config/FernSpec.js";
import { ApiDefinitionValidator } from "../validator/ApiDefinitionValidator.js";

const INDENT = {
    /** Base indent for file paths */
    FILE_PATH: 2,
    /** Indent for file paths when nested under API badge */
    FILE_PATH_NESTED: 4,
    /** Indent for location path relative to file (FILE_PATH + 2) */
    LOCATION: 2,
    /** Indent for violation message relative to file (FILE_PATH + 4) */
    VIOLATION: 4
} as const;

export declare namespace ApiChecker {
    /**
     * A validation violation with resolved file path relative to user's cwd.
     */
    export interface ResolvedViolation extends ValidationViolation {
        /** The API name this violation belongs to */
        apiName: string;
        /** The type of spec this violation originates from */
        apiSpecType: ApiSpecType;
        /** File path relative to user's current working directory */
        displayRelativeFilepath: string;
    }

    export interface Config {
        /** The CLI context */
        context: Context;

        /** CLI version for workspace metadata */
        cliVersion: string;

        /** Output stream for writing results (defaults to process.stderr) */
        stream?: NodeJS.WriteStream;

        /** The current task, if any */
        task?: Task;
    }

    export interface Result {
        /** APIs that passed validation (no errors) */
        validApis: Set<string>;

        /** APIs that failed validation (have errors) */
        invalidApis: Set<string>;

        /** Total error count */
        errorCount: number;

        /** Total warning count */
        warningCount: number;

        /** Time taken in milliseconds */
        elapsedMillis: number;
    }
}

export class ApiChecker {
    private readonly context: Context;
    private readonly cliVersion: string;
    private readonly stream: NodeJS.WriteStream;
    private readonly task: Task | undefined;

    constructor(config: ApiChecker.Config) {
        this.context = config.context;
        this.cliVersion = config.cliVersion;
        this.stream = config.stream ?? process.stderr;
        this.task = config.task;
    }

    /**
     * Check APIs in the workspace and display results.
     *
     * @param strict - If true, display all warnings and treat them as errors. If false,
     *                 only show errors but still report warning count in summary.
     */
    public async check({
        workspace,
        apiNames,
        strict = false
    }: {
        workspace: Workspace;
        apiNames?: string[];
        strict?: boolean;
    }): Promise<ApiChecker.Result> {
        const startTime = performance.now();
        const validApis = new Set<string>();
        const invalidApis = new Set<string>();

        const apisToCheck = apiNames ?? Object.keys(workspace.apis);
        if (apisToCheck.length === 0) {
            return {
                validApis,
                invalidApis,
                errorCount: 0,
                warningCount: 0,
                elapsedMillis: performance.now() - startTime
            };
        }

        const validator = new ApiDefinitionValidator({
            context: this.context,
            cliVersion: this.cliVersion,
            task: this.task
        });

        const allViolations: ApiChecker.ResolvedViolation[] = [];
        for (const apiName of apisToCheck) {
            const apiDefinition = workspace.apis[apiName];
            if (apiDefinition == null) {
                invalidApis.add(apiName);
                continue;
            }

            const result = await validator.validate(apiDefinition);
            if (result.hasErrors) {
                invalidApis.add(apiName);
            } else {
                validApis.add(apiName);
            }

            const apiSpecType: ApiSpecType = apiDefinition.specs.some(isFernSpec) ? "fern" : "openapi";
            const resolvedViolations = this.resolveViolationPaths(
                result.violations,
                result.workspaceRoot,
                apiName,
                apiSpecType
            );
            allViolations.push(...resolvedViolations);
        }

        const dedupedViolations = this.deduplicateViolations(allViolations);

        const { errorCount, warningCount } = this.countViolations(dedupedViolations);

        const violationsToDisplay = strict
            ? dedupedViolations
            : dedupedViolations.filter((v) => v.severity === "fatal" || v.severity === "error");

        const elapsedMillis = performance.now() - startTime;

        // Only produce output if there are violations to display (i.e. no news is good news).
        if (violationsToDisplay.length > 0) {
            this.writeHeader();
            this.displayViolations(violationsToDisplay);
            this.writeSummary({
                errorCount,
                warningCount,
                elapsedMillis,
                strict
            });
        }

        return {
            validApis,
            invalidApis,
            errorCount,
            warningCount,
            elapsedMillis
        };
    }

    private writeHeader(): void {
        this.stream.write("\n");
        this.stream.write(`${Icons.info} ${chalk.bold(`Validate APIs`)}\n`);
        this.stream.write("\n");
    }

    private writeSummary({
        errorCount,
        warningCount,
        elapsedMillis,
        strict
    }: {
        errorCount: number;
        warningCount: number;
        elapsedMillis: number;
        strict: boolean;
    }): void {
        const durationStr = this.formatDuration(elapsedMillis);
        const hasErrors = errorCount > 0;
        const hasWarnings = warningCount > 0;

        if (!hasErrors && !hasWarnings) {
            this.stream.write(`${Icons.success} All checks passed ${chalk.dim(`(${durationStr})`)}\n`);
            this.stream.write("\n");
            return;
        }

        // In strict mode, warnings are treated as failures.
        const isFailure = hasErrors || (strict && hasWarnings);
        if (isFailure) {
            const errorLabel = errorCount === 1 ? "error" : "errors";
            const warningLabel = warningCount === 1 ? "warning" : "warnings";
            this.stream.write(
                `${Icons.error} Found ${errorCount} ${errorLabel} and ${warningCount} ${warningLabel} ${chalk.dim(`(${durationStr})`)}\n`
            );
            if (!strict && warningCount > 0) {
                this.stream.write(chalk.dim("  Run 'fern check --strict' to treat warnings as errors\n"));
            }
            this.stream.write("\n");
            return;
        }

        const warningLabel = warningCount === 1 ? "warning" : "warnings";
        this.stream.write(
            `${Icons.success} Checks passed with ${warningCount} ${warningLabel} ${chalk.dim(`(${durationStr})`)}\n`
        );
        this.stream.write(chalk.dim("  Run 'fern check --strict' to treat warnings as errors\n"));
        this.stream.write("\n");
    }

    private resolveViolationPaths(
        violations: ValidationViolation[],
        workspaceRoot: AbsoluteFilePath,
        apiName: string,
        apiSpecType: ApiSpecType
    ): ApiChecker.ResolvedViolation[] {
        return violations.map((violation) => {
            const absolutePath = join(workspaceRoot, RelativeFilePath.of(violation.relativeFilepath));
            const displayRelativeFilepath = relativize(this.context.cwd, absolutePath);
            return {
                ...violation,
                displayRelativeFilepath,
                apiSpecType,
                apiName
            };
        });
    }

    private displayViolations(violations: ApiChecker.ResolvedViolation[]): void {
        if (violations.length === 0) {
            return;
        }

        // Group violations by API.
        const byApi = this.groupViolationsBy(violations, (v) => v.apiName);
        const sortedApis = Array.from(byApi.keys()).sort();

        // Only show API badges when there are multiple APIs.
        const showApiBadge = sortedApis.length > 1;

        for (const apiName of sortedApis) {
            const apiViolations = byApi.get(apiName);
            if (apiViolations == null || apiViolations.length === 0) {
                continue;
            }

            if (showApiBadge) {
                this.stream.write(`${" ".repeat(INDENT.FILE_PATH)}${chalk.bold(`[${apiName}]`)}\n`);
            }

            // Group violations by file, then by location within file.
            const byFile = this.groupViolationsBy(apiViolations, (v) => v.displayRelativeFilepath);
            const sortedFiles = Array.from(byFile.keys()).sort();
            const baseIndent = showApiBadge ? INDENT.FILE_PATH_NESTED : INDENT.FILE_PATH;

            for (const filePath of sortedFiles) {
                const fileViolations = byFile.get(filePath);
                if (fileViolations == null || fileViolations.length === 0) {
                    continue;
                }

                // Only display the file header for Fern definitions where the path
                // corresponds to a real file on disk.
                const firstFileViolation = fileViolations[0];
                if (firstFileViolation != null && firstFileViolation.apiSpecType === "fern") {
                    this.stream.write(`${" ".repeat(baseIndent)}${chalk.underline(filePath)}\n`);
                }

                // Group by location within the file.
                const byLocation = this.groupViolationsBy(fileViolations, (v) => this.getLocationKey(v.nodePath));
                const sortedLocations = Array.from(byLocation.keys()).sort();

                for (const locationKey of sortedLocations) {
                    const locationViolations = byLocation.get(locationKey);
                    if (locationViolations == null || locationViolations.length === 0) {
                        continue;
                    }

                    const firstViolation = locationViolations[0];
                    if (firstViolation != null && firstViolation.nodePath.length > 0) {
                        const locationPath = this.formatNodePath(firstViolation.nodePath);
                        this.stream.write(`${" ".repeat(baseIndent + INDENT.LOCATION)}${chalk.dim(locationPath)}\n`);
                    }

                    for (const violation of locationViolations) {
                        const { icon, colorFn } = this.getSeverityStyle(violation.severity);
                        const message =
                            violation.apiSpecType === "fern"
                                ? violation.message
                                : this.stripSyntheticFilePaths(violation.message);
                        const formatted = formatMessage({
                            message,
                            colorFn,
                            icon,
                            indent: baseIndent + INDENT.VIOLATION,
                            continuationIndent: 2
                        });
                        this.stream.write(`${formatted}\n`);
                    }
                }
            }

            this.stream.write("\n");
        }
    }

    private groupViolationsBy<K extends string>(
        violations: ApiChecker.ResolvedViolation[],
        keyFn: (v: ApiChecker.ResolvedViolation) => K
    ): Map<K, ApiChecker.ResolvedViolation[]> {
        const grouped = new Map<K, ApiChecker.ResolvedViolation[]>();
        for (const violation of violations) {
            const key = keyFn(violation);
            const existing = grouped.get(key) ?? [];
            existing.push(violation);
            grouped.set(key, existing);
        }
        return grouped;
    }

    private getLocationKey(nodePath: NodePath): string {
        return nodePath
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }
                return item.arrayIndex != null ? `${item.key}[${item.arrayIndex}]` : item.key;
            })
            .join(".");
    }

    private formatNodePath(nodePath: NodePath): string {
        const parts: string[] = [];
        for (const item of nodePath) {
            if (typeof item === "string") {
                parts.push(item);
            } else {
                const indexSuffix = item.arrayIndex != null ? `[${item.arrayIndex}]` : "";
                parts.push(`${item.key}${indexSuffix}`);
            }
        }
        return parts.join(" > ");
    }

    private getSeverityStyle(severity: ValidationViolation["severity"]): {
        icon: string;
        colorFn: (text: string) => string;
    } {
        switch (severity) {
            case "fatal":
            case "error":
                return { icon: Icons.error, colorFn: Colors.error };
            case "warning":
                return { icon: Icons.warning, colorFn: Colors.warning };
            default:
                assertNever(severity);
        }
    }

    private deduplicateViolations(violations: ApiChecker.ResolvedViolation[]): ApiChecker.ResolvedViolation[] {
        const seen = new Set<string>();
        return violations.filter((v) => {
            const key = `${v.apiName}|${v.displayRelativeFilepath}|${v.severity}|${JSON.stringify(v.nodePath)}|${v.message}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Strip synthetic file path references from violation messages for non-Fern specs.
     *
     * The validator produces messages like:
     *   "- pet.yml -> getPetById /pet/{petId}"
     * For non-Fern specs these file names are synthetic (they don't exist on disk),
     * so we strip them to produce:
     *   "- getPetById /pet/{petId}"
     */
    private stripSyntheticFilePaths(message: string): string {
        return message.replace(/^(\s*- )\S+\.[a-zA-Z]+ -> /gm, "$1");
    }

    private countViolations(violations: ApiChecker.ResolvedViolation[]): { errorCount: number; warningCount: number } {
        let errorCount = 0;
        let warningCount = 0;

        for (const violation of violations) {
            switch (violation.severity) {
                case "fatal":
                case "error":
                    errorCount++;
                    break;
                case "warning":
                    warningCount++;
                    break;
                default:
                    assertNever(violation.severity);
            }
        }

        return { errorCount, warningCount };
    }

    private formatDuration(ms: number): string {
        if (ms < 1000) {
            return `${Math.round(ms)}ms`;
        }
        return `${(ms / 1000).toFixed(1)}s`;
    }

    private maybePluralApis(apis: string[]): string {
        return apis.length === 1 ? "API" : "APIs";
    }
}
