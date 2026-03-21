import type { ValidationViolation } from "@fern-api/fern-definition-validator";

export declare namespace JsonOutput {
    export interface Violation {
        api?: string;
        severity: string;
        rule?: string;
        filepath?: string;
        line?: number;
        column?: number;
        message: string;
    }

    export interface Results {
        apis?: Violation[];
        docs?: Violation[];
        sdks?: Violation[];
    }

    export interface Response {
        success: boolean;
        results: Results;
    }
}

const ANSI_REGEX = new RegExp(`${String.fromCodePoint(0x1b)}\\[[0-9;]*m`, "g");

function stripAnsi(text: string): string {
    return text.replace(ANSI_REGEX, "");
}

export function toJsonViolation(
    violation: Pick<ValidationViolation, "severity" | "message" | "name"> & {
        displayRelativeFilepath?: string;
        line?: number;
        column?: number;
    },
    options?: { api?: string }
): JsonOutput.Violation {
    const result: JsonOutput.Violation = {
        severity: violation.severity,
        message: stripAnsi(violation.message)
    };
    if (options?.api != null) {
        result.api = options.api;
    }
    if (violation.name != null) {
        result.rule = violation.name;
    }
    if (violation.displayRelativeFilepath != null) {
        result.filepath = violation.displayRelativeFilepath;
    }
    if (violation.line != null) {
        result.line = violation.line;
    }
    if (violation.column != null) {
        result.column = violation.column;
    }
    return result;
}
