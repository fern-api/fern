import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InitCommand } from "../command.js";

vi.mock("@fern-api/generator-cli", async (importOriginal) => {
    const orig = await importOriginal<typeof import("@fern-api/generator-cli")>();
    return {
        ...orig,
        replayInit: vi.fn(),
        formatBootstrapSummary: vi.fn().mockReturnValue([])
    };
});

vi.mock("@fern-api/core", () => ({
    getFiddleOrigin: vi.fn().mockReturnValue("https://fiddle.example.com")
}));

function createMockLogger(): Logger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

function createMockContext(overrides: Record<string, unknown> = {}) {
    return {
        stdout: createMockLogger(),
        stderr: createMockLogger(),
        getTokenOrPrompt: vi.fn().mockResolvedValue({ type: "user", value: "fern-token-123" }),
        ...overrides
    } as unknown as import("../../../../context/Context.js").Context;
}

function baseArgs(overrides: Partial<InitCommand.Args> = {}): InitCommand.Args {
    return {
        github: "owner/repo",
        token: "ghp_test",
        "dry-run": false,
        force: false,
        ...overrides
    } as InitCommand.Args;
}

type ReplayInitResult = Awaited<ReturnType<typeof import("@fern-api/generator-cli").replayInit>>;

function makeCommitInfo(sha: string): ReplayInitResult["bootstrap"]["generationCommit"] {
    return { sha, authorName: "dev", authorEmail: "dev@example.com", message: "chore: generate" };
}

function makeBootstrap(
    generationCommit: ReplayInitResult["bootstrap"]["generationCommit"]
): ReplayInitResult["bootstrap"] {
    return {
        generationCommit,
        patchesDetected: 0,
        patchesCreated: 0,
        patches: [],
        fernignorePatterns: [],
        fernignoreUpdated: false,
        warnings: [],
        staleGenerationsSkipped: 0,
        scannedSinceGeneration: "abc0000"
    };
}

function makeInitResult(overrides: Partial<ReplayInitResult> = {}): ReplayInitResult {
    return {
        bootstrap: makeBootstrap(null),
        lockfileContent: undefined,
        fernignoreEntries: [],
        prBody: "",
        ...overrides
    };
}

describe("InitCommand", () => {
    let cmd: InitCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new InitCommand();
    });

    it("returns early when bootstrap has no generation commit", async () => {
        const { replayInit } = await import("@fern-api/generator-cli");
        vi.mocked(replayInit).mockResolvedValue(makeInitResult());

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.getTokenOrPrompt).not.toHaveBeenCalled();
    });

    it("returns early in dry-run mode without creating PR", async () => {
        const { replayInit } = await import("@fern-api/generator-cli");
        vi.mocked(replayInit).mockResolvedValue(
            makeInitResult({
                bootstrap: makeBootstrap(makeCommitInfo("abc")),
                lockfileContent: "lockfile-content",
                prBody: "body"
            })
        );

        const context = createMockContext();
        await cmd.handle(context, baseArgs({ "dry-run": true }));

        expect(context.getTokenOrPrompt).not.toHaveBeenCalled();
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Dry run complete"));
    });

    it("throws when lockfile content is missing after bootstrap", async () => {
        const { replayInit } = await import("@fern-api/generator-cli");
        vi.mocked(replayInit).mockResolvedValue(makeInitResult({ bootstrap: makeBootstrap(makeCommitInfo("abc")) }));

        const context = createMockContext();
        await expect(cmd.handle(context, baseArgs())).rejects.toThrow(CliError);
    });

    it("creates PR and prints URL on success", async () => {
        const { replayInit } = await import("@fern-api/generator-cli");
        vi.mocked(replayInit).mockResolvedValue(
            makeInitResult({
                bootstrap: makeBootstrap(makeCommitInfo("abc")),
                lockfileContent: "content",
                prBody: "body"
            })
        );

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ prUrl: "https://github.com/owner/repo/pull/1" })
        }) as unknown as typeof fetch;

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(
            expect.stringContaining("https://github.com/owner/repo/pull/1")
        );
    });

    it("throws CliError when response is missing prUrl", async () => {
        const { replayInit } = await import("@fern-api/generator-cli");
        vi.mocked(replayInit).mockResolvedValue(
            makeInitResult({
                bootstrap: makeBootstrap(makeCommitInfo("abc")),
                lockfileContent: "content",
                prBody: "body"
            })
        );

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ something: "else" })
        }) as unknown as typeof fetch;

        const context = createMockContext();
        await expect(cmd.handle(context, baseArgs())).rejects.toThrow(CliError);
    });

    it("throws CliError with GitHub App install message on 404", async () => {
        const { replayInit } = await import("@fern-api/generator-cli");
        vi.mocked(replayInit).mockResolvedValue(
            makeInitResult({
                bootstrap: makeBootstrap(makeCommitInfo("abc")),
                lockfileContent: "content",
                prBody: "body"
            })
        );

        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            text: vi.fn().mockResolvedValue("")
        }) as unknown as typeof fetch;

        const context = createMockContext();
        await expect(cmd.handle(context, baseArgs())).rejects.toThrow(
            expect.objectContaining({ message: expect.stringContaining("GitHub App") })
        );
    });

    it("throws when --github is missing and no --group provided", async () => {
        const context = createMockContext();
        await expect(cmd.handle(context, baseArgs({ github: undefined, group: undefined }))).rejects.toThrow(CliError);
    });

    it("warns when no token is provided", async () => {
        const { replayInit } = await import("@fern-api/generator-cli");
        vi.mocked(replayInit).mockResolvedValue(makeInitResult());

        const context = createMockContext();
        await cmd.handle(context, baseArgs({ token: undefined }));

        expect(context.stderr.warn).toHaveBeenCalledWith(expect.stringContaining("No GitHub token found"));
    });
});
