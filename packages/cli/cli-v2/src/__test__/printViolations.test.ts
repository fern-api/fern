import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { SourceLocation } from "@fern-api/source";
import { ValidationIssue } from "@fern-api/yaml-loader";
import chalk from "chalk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatIssues, formatViolations, toFormattableViolation } from "../errors/printViolations.js";

function stripAnsi(text: string): string {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape matching requires control characters.
    return text.replace(/\u001b\[[0-9;]*m/g, "");
}

const ORIGINAL_CHALK_LEVEL = chalk.level;

describe("formatViolations", () => {
    beforeEach(() => {
        chalk.level = 0;
    });
    afterEach(() => {
        chalk.level = ORIGINAL_CHALK_LEVEL;
    });

    it("returns an empty string when given no violations", () => {
        expect(formatViolations([])).toBe("");
    });

    it("renders file:line:col when line and column are present", () => {
        const out = stripAnsi(
            formatViolations([
                {
                    displayRelativeFilepath: "api/openapi.yml",
                    line: 12,
                    column: 4,
                    message: "operation missing summary",
                    severity: "error"
                }
            ])
        );
        expect(out).toBe("api/openapi.yml:12:4: operation missing summary");
    });

    it("omits line/col when they are not provided", () => {
        const out = stripAnsi(
            formatViolations([
                toFormattableViolation({
                    severity: "warning",
                    relativeFilepath: "fern.yml",
                    nodePath: [],
                    message: "deprecated key"
                })
            ])
        );
        expect(out).toBe("fern.yml: deprecated key");
    });
});

describe("formatIssues", () => {
    beforeEach(() => {
        chalk.level = 0;
    });
    afterEach(() => {
        chalk.level = ORIGINAL_CHALK_LEVEL;
    });

    it("returns an empty string when given no issues", () => {
        expect(formatIssues([])).toBe("");
    });

    it("renders each issue with its location and message", () => {
        const location = new SourceLocation({
            absoluteFilePath: AbsoluteFilePath.of("/tmp/fern.yml"),
            relativeFilePath: RelativeFilePath.of("fern.yml"),
            line: 3,
            column: 1
        });
        const issue = new ValidationIssue({ location, message: "org is required" });

        const out = stripAnsi(formatIssues([issue]));
        expect(out).toBe("fern.yml:3:1: org is required");
    });
});
