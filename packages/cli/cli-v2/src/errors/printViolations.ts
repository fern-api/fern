import { ValidationIssue } from "@fern-api/yaml-loader";
import chalk from "chalk";

import type { ValidationViolation } from "./ValidationViolation.js";

/**
 * Shape of a single line emitted by violation printing.
 *
 * Commands that need to render their own violation lists (e.g. `fern beta check`,
 * `fern beta sdk generate`) should call {@link formatViolations}/{@link formatIssues}
 * rather than rolling their own loop, so the format stays consistent with what
 * the top-level error boundary prints when the same error escapes a handler.
 */
export interface FormatViolationOptions {
    /** Optional line number, 1-based. */
    line?: number;
    /** Optional column number, 1-based. */
    column?: number;
}

export interface FormattableViolation {
    displayRelativeFilepath: string;
    line?: number;
    column?: number;
    message: string;
    severity: "fatal" | "error" | "warning" | string;
}

/**
 * Format a list of validation violations into a multi-line string suitable for
 * writing to stderr.
 *
 * - Errors are red, warnings are yellow.
 * - Each line is `file:line:col: message` (line/col are omitted when unknown).
 * - Returns "" when given an empty list — callers can append unconditionally.
 */
export function formatViolations(violations: ReadonlyArray<FormattableViolation>): string {
    if (violations.length === 0) {
        return "";
    }
    return violations.map(formatSingleViolation).join("\n");
}

function formatSingleViolation(v: FormattableViolation): string {
    const color = v.severity === "warning" ? chalk.yellow : chalk.red;
    const location = formatLocation(v.displayRelativeFilepath, v.line, v.column);
    return color(`${location}: ${v.message}`);
}

function formatLocation(filepath: string, line?: number, column?: number): string {
    const parts: string[] = [filepath];
    if (line != null) {
        parts.push(String(line));
        if (column != null) {
            parts.push(String(column));
        }
    }
    return parts.join(":");
}

/**
 * Format a list of {@link ValidationIssue}s (used for YAML/JSON-schema-style
 * validation where location info comes from a parser).
 */
export function formatIssues(issues: ReadonlyArray<ValidationIssue>): string {
    if (issues.length === 0) {
        return "";
    }
    return issues.map((issue) => chalk.red(issue.toString())).join("\n");
}

/**
 * Project a {@link ValidationViolation} (from the legacy `relativeFilepath`
 * shape) into the canonical {@link FormattableViolation} shape used by the
 * shared printer.
 */
export function toFormattableViolation(violation: ValidationViolation): FormattableViolation {
    return {
        displayRelativeFilepath: violation.relativeFilepath,
        message: violation.message,
        severity: violation.severity
    };
}
