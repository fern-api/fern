import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { SourceLocation } from "@fern-api/source";
import { CliError, TaskAbortSignal } from "@fern-api/task-context";
import { ValidationIssue } from "@fern-api/yaml-loader";
import chalk from "chalk";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { KeyringUnavailableError } from "../auth/errors/KeyringUnavailableError.js";
import { renderError } from "../errors/renderError.js";
import { SourcedValidationError } from "../errors/SourcedValidationError.js";
import { ValidationError } from "../errors/ValidationError.js";

function stripAnsi(text: string): string {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: matching ANSI escape sequences requires the ESC control character.
    return text.replace(/\u001b\[[0-9;]*m/g, "");
}

function renderPlain(error: unknown, options: { debug?: boolean } = {}): string {
    return stripAnsi(renderError(error, options) ?? "");
}

const ORIGINAL_CHALK_LEVEL = chalk.level;

describe("renderError", () => {
    beforeEach(() => {
        chalk.level = 0;
    });
    afterEach(() => {
        chalk.level = ORIGINAL_CHALK_LEVEL;
    });

    it("returns null for TaskAbortSignal so the boundary stays silent on Ctrl+C", () => {
        const result = renderError(new TaskAbortSignal());
        expect(result).toBeNull();
    });

    it("renders a CliError with code, title, hint, and docs link", () => {
        const error = new CliError({
            code: CliError.Code.AuthError,
            message: "Unauthorized.",
            hint: "Run `fern auth login`.",
            docsLink: "https://buildwithfern.com/learn/cli/auth"
        });

        const out = renderPlain(error);

        expect(out).toContain("error[AUTH_ERROR]: Unauthorized.");
        expect(out).toContain("hint: Run `fern auth login`.");
        expect(out).toContain("see:  https://buildwithfern.com/learn/cli/auth");
    });

    it("falls back to a per-code title when the CliError has no message", () => {
        const error = new CliError({ code: CliError.Code.ValidationError });
        const out = renderPlain(error);
        expect(out).toContain("error[VALIDATION_ERROR]: Validation failed");
    });

    it("uses subsequent lines of the message as the detail body", () => {
        const error = new CliError({
            code: CliError.Code.ConfigError,
            message: "API 'foo' not found.\nAvailable APIs: bar, baz"
        });

        const out = renderPlain(error);

        expect(out).toContain("error[CONFIG_ERROR]: API 'foo' not found.");
        expect(out).toContain("Available APIs: bar, baz");
    });

    it("renders ValidationError violations in the detail body", () => {
        const error = new ValidationError([
            {
                severity: "error",
                relativeFilepath: "fern.yml",
                message: "org is required",
                nodePath: []
            },
            {
                severity: "warning",
                relativeFilepath: "fern.yml",
                message: "consider setting `version`",
                nodePath: []
            }
        ]);

        const out = renderPlain(error);

        expect(out).toContain("error[VALIDATION_ERROR]: Validation failed");
        expect(out).toContain("fern.yml: org is required");
        expect(out).toContain("fern.yml: consider setting `version`");
    });

    it("renders SourcedValidationError issues with file:line:col locations", () => {
        const location = new SourceLocation({
            absoluteFilePath: AbsoluteFilePath.of("/tmp/fern.yml"),
            relativeFilePath: RelativeFilePath.of("fern.yml"),
            line: 7,
            column: 13
        });
        const issue = new ValidationIssue({
            location,
            message: "sdks.targets.node.lang must be one of: csharp, go, java"
        });

        const out = renderPlain(new SourcedValidationError([issue]));

        expect(out).toContain("error[VALIDATION_ERROR]: Validation failed");
        expect(out).toContain("fern.yml:7:13: sdks.targets.node.lang must be one of: csharp, go, java");
    });

    it("renders a KeyringUnavailableError with its multi-line guidance", () => {
        const error = new KeyringUnavailableError("linux", new Error("dbus not running"));

        const out = renderPlain(error);
        expect(out).toContain("error[AUTH_ERROR]:");
        expect(out).toContain("Fern requires");
    });

    it("falls back to the unknown-error envelope for non-Error throwables", () => {
        const out = renderPlain("oops, a string was thrown");
        expect(out).toContain("error: oops, a string was thrown");
    });

    it("renders a generic Error with no code prefix", () => {
        const out = renderPlain(new Error("boom"));
        expect(out).toContain("error: boom");
        expect(out).not.toContain("error[");
    });

    it("omits stack traces by default", () => {
        const out = renderPlain(new CliError({ code: CliError.Code.InternalError, message: "boom" }));
        expect(out).not.toMatch(/at\s+\w/);
    });

    it("includes the stack and cause chain when debug=true", () => {
        const cause = new Error("inner");
        const outer = new CliError({ code: CliError.Code.InternalError, message: "outer" });
        (outer as { cause?: unknown }).cause = cause;

        const out = renderPlain(outer, { debug: true });

        expect(out).toContain("error[INTERNAL_ERROR]: outer");
        expect(out).toContain("caused by: Error: inner");
    });
});
