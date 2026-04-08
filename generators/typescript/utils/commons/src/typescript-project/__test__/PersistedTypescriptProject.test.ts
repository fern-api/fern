import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { readFile, rm } from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PersistedTypescriptProject } from "../PersistedTypescriptProject.js";

// Mock createLoggingExecutable so we never shell out to a real package manager
vi.mock("@fern-api/logging-execa", () => ({
    createLoggingExecutable: vi.fn()
}));

// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- must be after vi.mock
const { createLoggingExecutable } = await import("@fern-api/logging-execa");
const mockedCreateLoggingExecutable = vi.mocked(createLoggingExecutable);

function makeProject(overrides: Partial<PersistedTypescriptProject.Init> = {}): PersistedTypescriptProject {
    return new PersistedTypescriptProject({
        directory: AbsoluteFilePath.of("/tmp/fake-project"),
        srcDirectory: RelativeFilePath.of("src"),
        distDirectory: RelativeFilePath.of("dist"),
        testDirectory: RelativeFilePath.of("tests"),
        buildCommand: ["run", "build"],
        formatCommand: ["run", "format"],
        checkFixCommand: ["run", "check:fix"],
        checkFixPackages: [],
        checkFixToolBinaries: [],
        runScripts: true,
        packageManager: "pnpm",
        ...overrides
    });
}

function collectLogs(): { lines: string[]; logger: ReturnType<typeof createLogger> } {
    const lines: string[] = [];
    const logger = createLogger((_level, ...args) => lines.push(args.join(" ")));
    return { lines, logger };
}

describe("PersistedTypescriptProject", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("format", () => {
        afterEach(async () => {
            try {
                await rm("/tmp/fern-format.log");
            } catch {
                // ignore if file doesn't exist
            }
        });

        it("writes stdout and stderr to /tmp/fern-format.log", async () => {
            const mockExecutable = vi.fn().mockResolvedValue({
                stdout: "formatted 42 files",
                stderr: "warning: trailing whitespace"
            });
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger, lines } = collectLogs();
            const project = makeProject();

            await project.format(logger);

            // Verify createLoggingExecutable was called with doNotPipeOutput: true
            expect(mockedCreateLoggingExecutable).toHaveBeenCalledWith(
                "pnpm",
                expect.objectContaining({ doNotPipeOutput: true })
            );

            // Verify the log file was written with both stdout and stderr
            const logContent = await readFile("/tmp/fern-format.log", "utf-8");
            expect(logContent).toContain("formatted 42 files");
            expect(logContent).toContain("warning: trailing whitespace");

            // Verify debug log about the file being written
            expect(lines.some((l) => l.includes("format output written to /tmp/fern-format.log"))).toBe(true);
        });

        it("does not write log file when stdout and stderr are empty", async () => {
            const mockExecutable = vi.fn().mockResolvedValue({
                stdout: "",
                stderr: ""
            });
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.format(logger);

            // File should not exist since there was no output
            await expect(readFile("/tmp/fern-format.log", "utf-8")).rejects.toThrow();
        });

        it("skips when runScripts is false", async () => {
            const mockExecutable = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger } = collectLogs();
            const project = makeProject({ runScripts: false });

            await project.format(logger);

            expect(mockExecutable).not.toHaveBeenCalled();
        });

        it("logs error and writes output to log file when command throws", async () => {
            const error = Object.assign(new Error("biome crashed"), {
                stdout: "partial format output",
                stderr: "error: syntax error in file.ts"
            });
            const mockExecutable = vi.fn().mockRejectedValue(error);
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger, lines } = collectLogs();
            const project = makeProject();

            await project.format(logger);

            expect(lines.some((l) => l.includes("Failed to format the generated project"))).toBe(true);

            // Verify tool output is still captured to the log file on failure
            const logContent = await readFile("/tmp/fern-format.log", "utf-8");
            expect(logContent).toContain("partial format output");
            expect(logContent).toContain("error: syntax error in file.ts");
        });
    });

    describe("publish", () => {
        const publishInfo = {
            registryUrl: "https://npm.buildwithfern.com",
            token: "fern_test_token_123"
        };

        it("adds --tag preview for prerelease versions", async () => {
            const mockNpm = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
            mockedCreateLoggingExecutable.mockReturnValue(mockNpm);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.publish({
                logger,
                publishInfo,
                dryRun: false,
                shouldTolerateRepublish: false,
                version: "0.0.1-abc123.1234567890"
            });

            // Second call is the publish command (first is npm config set)
            const publishCall = mockNpm.mock.calls[1]?.[0] as string[];
            expect(publishCall).toContain("--tag");
            expect(publishCall).toContain("preview");
        });

        it("does not add --tag for stable versions", async () => {
            const mockNpm = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
            mockedCreateLoggingExecutable.mockReturnValue(mockNpm);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.publish({
                logger,
                publishInfo,
                dryRun: false,
                shouldTolerateRepublish: false,
                version: "1.0.0"
            });

            const publishCall = mockNpm.mock.calls[1]?.[0] as string[];
            expect(publishCall).not.toContain("--tag");
        });

        it("does not add --tag when version is undefined", async () => {
            const mockNpm = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
            mockedCreateLoggingExecutable.mockReturnValue(mockNpm);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.publish({
                logger,
                publishInfo,
                dryRun: false,
                shouldTolerateRepublish: false
            });

            const publishCall = mockNpm.mock.calls[1]?.[0] as string[];
            expect(publishCall).not.toContain("--tag");
        });

        it("includes --dry-run and --tolerate-republish when requested", async () => {
            const mockNpm = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
            mockedCreateLoggingExecutable.mockReturnValue(mockNpm);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.publish({
                logger,
                publishInfo,
                dryRun: true,
                shouldTolerateRepublish: true,
                version: "0.0.1-preview.123"
            });

            const publishCall = mockNpm.mock.calls[1]?.[0] as string[];
            expect(publishCall).toContain("--tag");
            expect(publishCall).toContain("--dry-run");
            expect(publishCall).toContain("--tolerate-republish");
        });

        it("sets auth token with registry host", async () => {
            const mockNpm = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
            mockedCreateLoggingExecutable.mockReturnValue(mockNpm);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.publish({
                logger,
                publishInfo,
                dryRun: false,
                shouldTolerateRepublish: false
            });

            const configCall = mockNpm.mock.calls[0]?.[0] as string[];
            expect(configCall).toEqual(["config", "set", "//npm.buildwithfern.com/:_authToken", "fern_test_token_123"]);
        });
    });

    describe("checkFix", () => {
        afterEach(async () => {
            try {
                await rm("/tmp/fern-checkFix.log");
            } catch {
                // ignore if file doesn't exist
            }
        });

        it("writes stdout and stderr to /tmp/fern-checkFix.log", async () => {
            const mockExecutable = vi.fn().mockResolvedValue({
                stdout: "checked 100 files",
                stderr: "fixed 3 issues"
            });
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger, lines } = collectLogs();
            const project = makeProject();

            await project.checkFix(logger);

            // Verify createLoggingExecutable was called with doNotPipeOutput: true and reject: false
            expect(mockedCreateLoggingExecutable).toHaveBeenCalledWith(
                "pnpm",
                expect.objectContaining({ doNotPipeOutput: true, reject: false })
            );

            // Verify the log file was written
            const logContent = await readFile("/tmp/fern-checkFix.log", "utf-8");
            expect(logContent).toContain("checked 100 files");
            expect(logContent).toContain("fixed 3 issues");

            // Verify debug log
            expect(lines.some((l) => l.includes("checkFix output written to /tmp/fern-checkFix.log"))).toBe(true);
        });

        it("does not write log file when stdout and stderr are empty", async () => {
            const mockExecutable = vi.fn().mockResolvedValue({
                stdout: "",
                stderr: ""
            });
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.checkFix(logger);

            await expect(readFile("/tmp/fern-checkFix.log", "utf-8")).rejects.toThrow();
        });

        it("skips when runScripts is false", async () => {
            const mockExecutable = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger } = collectLogs();
            const project = makeProject({ runScripts: false });

            await project.checkFix(logger);

            expect(mockExecutable).not.toHaveBeenCalled();
        });

        it("writes only stdout when stderr is empty", async () => {
            const mockExecutable = vi.fn().mockResolvedValue({
                stdout: "all checks passed",
                stderr: ""
            });
            mockedCreateLoggingExecutable.mockReturnValue(mockExecutable);

            const { logger } = collectLogs();
            const project = makeProject();

            await project.checkFix(logger);

            const logContent = await readFile("/tmp/fern-checkFix.log", "utf-8");
            expect(logContent).toBe("all checks passed");
        });
    });
});
