import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { TaskContext } from "@fern-api/task-context";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalTaskHandler } from "../LocalTaskHandler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read source files for static analysis tests
const diffAnalyzerBamlPath = resolve(__dirname, "../../../../../../cli/ai/baml_src/diff_analyzer.baml");
const diffAnalyzerBaml = readFileSync(diffAnalyzerBamlPath, "utf-8");

const localTaskHandlerPath = resolve(__dirname, "../LocalTaskHandler.ts");
const localTaskHandlerSource = readFileSync(localTaskHandlerPath, "utf-8");

// Mock loggingExeca to control git log output
vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn()
}));

// Helper to create a minimal LocalTaskHandler for testing readSpecCommitMessage
function createHandler(absolutePathToSpecRepo: AbsoluteFilePath | undefined): LocalTaskHandler {
    const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        log: vi.fn(),
        trace: vi.fn()
    };
    return new LocalTaskHandler({
        context: { logger: mockLogger } as unknown as TaskContext,
        absolutePathToTmpOutputDirectory: AbsoluteFilePath.of("/tmp/output"),
        absolutePathToTmpSnippetJSON: undefined,
        absolutePathToLocalSnippetTemplateJSON: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/local-output"),
        absolutePathToLocalSnippetJSON: undefined,
        absolutePathToTmpSnippetTemplatesJSON: undefined,
        version: undefined,
        ai: undefined,
        isWhitelabel: false,
        generatorLanguage: undefined,
        absolutePathToSpecRepo
    });
}

describe("LocalTaskHandler.readSpecCommitMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("reads most recent .fern/ commit message from spec repo", async () => {
        const { loggingExeca } = await import("@fern-api/logging-execa");
        vi.mocked(loggingExeca).mockResolvedValueOnce({
            stdout: "add /payments endpoint\n",
            stderr: "",
            exitCode: 0,
            command: "git log",
            escapedCommand: "git log"
        } as unknown as Awaited<ReturnType<typeof loggingExeca>>);

        const handler = createHandler(AbsoluteFilePath.of("/path/to/spec-repo"));
        const result = await handler.readSpecCommitMessage();

        expect(result).toBe("add /payments endpoint");
        expect(loggingExeca).toHaveBeenCalledWith(
            expect.anything(),
            "git",
            ["log", "-1", "--format=%B", "--", ".fern/"],
            expect.objectContaining({ cwd: "/path/to/spec-repo", doNotPipeOutput: true })
        );
    });

    it("returns empty string for merge commit messages", async () => {
        const { loggingExeca } = await import("@fern-api/logging-execa");
        vi.mocked(loggingExeca).mockResolvedValueOnce({
            stdout: "Merge branch 'main' into feature/payments\n",
            stderr: "",
            exitCode: 0,
            command: "git log",
            escapedCommand: "git log"
        } as unknown as Awaited<ReturnType<typeof loggingExeca>>);

        const handler = createHandler(AbsoluteFilePath.of("/path/to/spec-repo"));
        const result = await handler.readSpecCommitMessage();

        expect(result).toBe("");
    });

    it("truncates spec commit message longer than 500 characters", async () => {
        const { loggingExeca } = await import("@fern-api/logging-execa");
        const longMessage = "a".repeat(600);
        vi.mocked(loggingExeca).mockResolvedValueOnce({
            stdout: longMessage,
            stderr: "",
            exitCode: 0,
            command: "git log",
            escapedCommand: "git log"
        } as unknown as Awaited<ReturnType<typeof loggingExeca>>);

        const handler = createHandler(AbsoluteFilePath.of("/path/to/spec-repo"));
        const result = await handler.readSpecCommitMessage();

        expect(result.length).toBe(501); // 500 chars + ellipsis
        expect(result).toBe("a".repeat(500) + "\u2026");
    });

    it("returns empty string when git log command fails", async () => {
        const { loggingExeca } = await import("@fern-api/logging-execa");
        vi.mocked(loggingExeca).mockRejectedValueOnce(new Error("not a git repository"));

        const handler = createHandler(AbsoluteFilePath.of("/path/to/not-a-repo"));
        const result = await handler.readSpecCommitMessage();

        expect(result).toBe("");
    });

    it("returns empty string when absolutePathToSpecRepo is undefined", async () => {
        const handler = createHandler(undefined);
        const result = await handler.readSpecCommitMessage();

        expect(result).toBe("");
    });

    it("returns empty string for messages shorter than 5 characters", async () => {
        const { loggingExeca } = await import("@fern-api/logging-execa");
        vi.mocked(loggingExeca).mockResolvedValueOnce({
            stdout: "fix\n",
            stderr: "",
            exitCode: 0,
            command: "git log",
            escapedCommand: "git log"
        } as unknown as Awaited<ReturnType<typeof loggingExeca>>);

        const handler = createHandler(AbsoluteFilePath.of("/path/to/spec-repo"));
        const result = await handler.readSpecCommitMessage();

        expect(result).toBe("");
    });

    it("returns empty string for empty git output", async () => {
        const { loggingExeca } = await import("@fern-api/logging-execa");
        vi.mocked(loggingExeca).mockResolvedValueOnce({
            stdout: "",
            stderr: "",
            exitCode: 0,
            command: "git log",
            escapedCommand: "git log"
        } as unknown as Awaited<ReturnType<typeof loggingExeca>>);

        const handler = createHandler(AbsoluteFilePath.of("/path/to/spec-repo"));
        const result = await handler.readSpecCommitMessage();

        expect(result).toBe("");
    });
});

describe("LocalTaskHandler spec_commit_message integration", () => {
    it("BAML function signature includes spec_commit_message parameter", () => {
        expect(diffAnalyzerBaml).toContain("spec_commit_message: string");
        expect(diffAnalyzerBaml).toContain(
            "The commit message from the API spec repository that triggered this SDK generation"
        );
    });

    it("BAML prompt includes conditional spec_commit_message block", () => {
        expect(diffAnalyzerBaml).toContain("{% if spec_commit_message %}");
        expect(diffAnalyzerBaml).toContain(
            "The API spec change that triggered this SDK generation had the following commit message:"
        );
        expect(diffAnalyzerBaml).toContain("{{spec_commit_message}}");
        expect(diffAnalyzerBaml).toContain("Use this as ground truth for the nature of the change");
    });

    it("BAML function signature includes prior_changelog parameter", () => {
        expect(diffAnalyzerBaml).toContain("prior_changelog: string");
    });

    it("passes spec commit message to AnalyzeSdkDiff when available", () => {
        // Verify the call site passes specCommitMessage
        expect(localTaskHandlerSource).toContain("specCommitMessage");
        expect(localTaskHandlerSource).toContain("await this.readSpecCommitMessage()");
    });

    it("passes empty string to AnalyzeSdkDiff when spec commit unavailable", () => {
        // The getAnalysis method has a default value of "" for specCommitMessage
        expect(localTaskHandlerSource).toContain('specCommitMessage: string = ""');
    });

    it("LocalTaskHandler Init interface includes absolutePathToSpecRepo field", () => {
        expect(localTaskHandlerSource).toContain("absolutePathToSpecRepo: AbsoluteFilePath | undefined;");
    });
});
