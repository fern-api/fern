import chalk from "chalk";
import type { Context } from "../../context/Context.js";
import { Colors, formatMessage, Icons } from "../../ui/format.js";
import type { Task } from "../../ui/Task.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { LANGUAGES, type Language } from "../config/Language.js";
import type { Target } from "../config/Target.js";

const INDENT = {
    /** Base indent for target names */
    TARGET: 2,
    /** Indent for violation messages relative to target (TARGET + 4) */
    VIOLATION: 4
} as const;

export declare namespace SdkChecker {
    export interface Violation {
        /** The target name this violation belongs to */
        targetName: string;
        /** The violation severity */
        severity: "error" | "warning";
        /** The violation message */
        message: string;
    }

    export interface Config {
        /** The CLI context */
        context: Context;

        /** Output stream for writing results (defaults to process.stderr) */
        stream?: NodeJS.WriteStream;

        /** The current task, if any */
        task?: Task;
    }

    export interface Result {
        /** Total error count */
        errorCount: number;

        /** Total warning count */
        warningCount: number;

        /** Time taken in milliseconds */
        elapsedMillis: number;
    }
}

export class SdkChecker {
    private readonly context: Context;
    private readonly stream: NodeJS.WriteStream;
    private readonly task: Task | undefined;

    constructor(config: SdkChecker.Config) {
        this.context = config.context;
        this.stream = config.stream ?? process.stderr;
        this.task = config.task;
    }

    /**
     * Check SDK configuration in the workspace and display results.
     *
     * Validates:
     *  1. The `sdks` configuration is present and was successfully parsed (zod schema validity).
     *  2. All configured targets have a valid `lang` entry.
     *  3. All configured target versions are valid semver-like strings (not empty).
     */
    public check({ workspace }: { workspace: Workspace }): SdkChecker.Result {
        const startTime = performance.now();
        const violations: SdkChecker.Violation[] = [];

        if (workspace.sdks == null) {
            // No SDKs configured — nothing to check.
            return {
                errorCount: 0,
                warningCount: 0,
                elapsedMillis: performance.now() - startTime
            };
        }

        for (const target of workspace.sdks.targets) {
            this.validateTarget({ target, violations });
        }

        const { errorCount, warningCount } = this.countViolations(violations);
        const elapsedMillis = performance.now() - startTime;

        // Only produce output if there are violations to display.
        if (violations.length > 0) {
            this.writeHeader();
            this.displayViolations(violations);
            this.writeSummary({ errorCount, warningCount, elapsedMillis });
        }

        return {
            errorCount,
            warningCount,
            elapsedMillis
        };
    }

    private validateTarget({
        target,
        violations
    }: {
        target: Target;
        violations: SdkChecker.Violation[];
    }): void {
        this.validateLanguage({ target, violations });
        this.validateVersion({ target, violations });
    }

    /**
     * Validates that the target has a valid `lang` entry that matches a known language.
     *
     * After the SdkConfigConverter runs, the `lang` field should already be set for us.
     * This is a defense-in-depth check to ensure it's valid.
     */
    private validateLanguage({
        target,
        violations
    }: {
        target: Target;
        violations: SdkChecker.Violation[];
    }): void {
        const lang: Language = target.lang;
        if (!LANGUAGES.includes(lang)) {
            violations.push({
                targetName: target.name,
                severity: "error",
                message: `"${target.lang}" is not a supported language. Supported languages: ${LANGUAGES.join(", ")}`
            });
        }
    }

    /**
     * Validates that the target version is present and non-empty.
     *
     * A version of "latest" is acceptable — it means the latest available version
     * will be resolved at generation time.
     */
    private validateVersion({
        target,
        violations
    }: {
        target: Target;
        violations: SdkChecker.Violation[];
    }): void {
        if (target.version.length === 0) {
            violations.push({
                targetName: target.name,
                severity: "error",
                message: "version must not be empty"
            });
        }
    }

    private writeHeader(): void {
        this.stream.write("\n");
        this.stream.write(`${Icons.info} ${chalk.bold("Validate SDKs")}\n`);
        this.stream.write("\n");
    }

    private writeSummary({
        errorCount,
        warningCount,
        elapsedMillis
    }: {
        errorCount: number;
        warningCount: number;
        elapsedMillis: number;
    }): void {
        const durationStr = this.formatDuration(elapsedMillis);
        const hasErrors = errorCount > 0;
        const hasWarnings = warningCount > 0;

        if (!hasErrors && !hasWarnings) {
            this.stream.write(`${Icons.success} All SDK checks passed ${chalk.dim(`(${durationStr})`)}\n`);
            this.stream.write("\n");
            return;
        }

        if (hasErrors) {
            const errorLabel = errorCount === 1 ? "error" : "errors";
            const warningLabel = warningCount === 1 ? "warning" : "warnings";
            this.stream.write(
                `${Icons.error} Found ${errorCount} ${errorLabel} and ${warningCount} ${warningLabel} ${chalk.dim(`(${durationStr})`)}\n`
            );
            this.stream.write("\n");
            return;
        }

        const warningLabel = warningCount === 1 ? "warning" : "warnings";
        this.stream.write(
            `${Icons.success} SDK checks passed with ${warningCount} ${warningLabel} ${chalk.dim(`(${durationStr})`)}\n`
        );
        this.stream.write("\n");
    }

    private displayViolations(violations: SdkChecker.Violation[]): void {
        if (violations.length === 0) {
            return;
        }

        // Group violations by target.
        const byTarget = new Map<string, SdkChecker.Violation[]>();
        for (const violation of violations) {
            const existing = byTarget.get(violation.targetName) ?? [];
            existing.push(violation);
            byTarget.set(violation.targetName, existing);
        }

        const sortedTargets = Array.from(byTarget.keys()).sort();
        for (const targetName of sortedTargets) {
            const targetViolations = byTarget.get(targetName);
            if (targetViolations == null || targetViolations.length === 0) {
                continue;
            }

            this.stream.write(`${" ".repeat(INDENT.TARGET)}${chalk.underline(targetName)}\n`);

            for (const violation of targetViolations) {
                const { icon, colorFn } = this.getSeverityStyle(violation.severity);
                const formatted = formatMessage({
                    message: violation.message,
                    colorFn,
                    icon,
                    indent: INDENT.VIOLATION,
                    continuationIndent: 2
                });
                this.stream.write(`${formatted}\n`);
            }

            this.stream.write("\n");
        }
    }

    private getSeverityStyle(severity: SdkChecker.Violation["severity"]): {
        icon: string;
        colorFn: (text: string) => string;
    } {
        switch (severity) {
            case "error":
                return { icon: Icons.error, colorFn: Colors.error };
            case "warning":
                return { icon: Icons.warning, colorFn: Colors.warning };
        }
    }

    private countViolations(violations: SdkChecker.Violation[]): { errorCount: number; warningCount: number } {
        let errorCount = 0;
        let warningCount = 0;

        for (const violation of violations) {
            switch (violation.severity) {
                case "error":
                    errorCount++;
                    break;
                case "warning":
                    warningCount++;
                    break;
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
}
