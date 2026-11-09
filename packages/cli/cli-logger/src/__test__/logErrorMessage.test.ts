import { createLogger, LogLevel } from "@fern-api/logger";
import { CliError, TaskAbortSignal } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logErrorMessage } from "../logErrorMessage.js";

const HINT = "For guidance, run `fern instructions new-site`.";

function captureLogs(): { lines: string[]; logger: ReturnType<typeof createLogger> } {
    const lines: string[] = [];
    const logger = createLogger((level, ...args) => {
        if (level !== LogLevel.Debug) {
            lines.push(args.join(" "));
        }
    });
    return { lines, logger };
}

describe("logErrorMessage instructions hint", () => {
    beforeEach(() => {
        for (const name of ["AI_AGENT", "CLAUDECODE", "CLAUDE_CODE", "CURSOR_AGENT", "CODEX_SANDBOX", "EDITOR"]) {
            vi.stubEnv(name, "");
        }
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("prints the topic from a CliError to coding agents", () => {
        vi.stubEnv("CLAUDECODE", "1");
        const { lines, logger } = captureLogs();
        const error = new CliError({
            message: 'Directory "fern" not found.',
            code: CliError.Code.ConfigError,
            instructionsTopic: "new-site"
        });
        logErrorMessage({ message: undefined, error, logger });
        expect(lines).toEqual(['Directory "fern" not found.', HINT]);
    });

    it("prints the topic passed by failAndThrow callers after the message", () => {
        vi.stubEnv("AI_AGENT", "codex");
        const { lines, logger } = captureLogs();
        logErrorMessage({ message: "Something failed.", error: undefined, logger, instructionsTopic: "new-site" });
        expect(lines).toEqual(["Something failed.", HINT]);
    });

    it("prefers the explicit topic over the error's topic", () => {
        vi.stubEnv("AI_AGENT", "codex");
        const { lines, logger } = captureLogs();
        const error = new CliError({
            message: "Cause.",
            code: CliError.Code.UserError,
            instructionsTopic: "sdks migrate"
        });
        logErrorMessage({ message: "Something failed.", error, logger, instructionsTopic: "new-site" });
        expect(lines).toEqual(["Something failed.", "Cause.", HINT]);
    });

    it("points to the topic list for the index topic", () => {
        vi.stubEnv("AI_AGENT", "codex");
        const { lines, logger } = captureLogs();
        logErrorMessage({ message: "Unknown argument: foo", error: undefined, logger, instructionsTopic: "" });
        expect(lines).toEqual(["Unknown argument: foo", "For guidance, run `fern instructions`."]);
    });

    it("omits the hint outside coding agents", () => {
        const { lines, logger } = captureLogs();
        const error = new CliError({ message: "Oops.", code: CliError.Code.UserError, instructionsTopic: "new-site" });
        logErrorMessage({ message: undefined, error, logger });
        expect(lines).toEqual(["Oops."]);
    });

    it("omits the hint when no topic is set", () => {
        vi.stubEnv("CLAUDECODE", "1");
        const { lines, logger } = captureLogs();
        logErrorMessage({ message: "Oops.", error: new Error("cause"), logger });
        expect(lines).toEqual(["Oops.", "cause"]);
    });

    it("leaves already-logged TaskAbortSignal failures alone", () => {
        vi.stubEnv("CLAUDECODE", "1");
        const { lines, logger } = captureLogs();
        logErrorMessage({ message: undefined, error: new TaskAbortSignal(), logger, instructionsTopic: "new-site" });
        expect(lines).toEqual([]);
    });
});
