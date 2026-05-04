import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResolveCommand } from "../command.js";

vi.mock("@fern-api/generator-cli", () => ({
    replayResolve: vi.fn()
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

function createMockContext() {
    return {
        stdout: createMockLogger(),
        stderr: createMockLogger()
    } as unknown as import("../../../../context/Context.js").Context;
}

function baseArgs(overrides: Partial<ResolveCommand.Args> = {}): ResolveCommand.Args {
    return {
        directory: ".",
        "no-check-markers": false,
        ...overrides
    } as ResolveCommand.Args;
}

type ResolveResult = Awaited<ReturnType<typeof import("@fern-api/generator-cli").replayResolve>>;

function makeResolveResult(overrides: Partial<ResolveResult> = {}): ResolveResult {
    return {
        success: true,
        ...overrides
    };
}

describe("ResolveCommand", () => {
    let cmd: ResolveCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new ResolveCommand();
    });

    it("reports applied patches with no conflicts", async () => {
        const { replayResolve } = await import("@fern-api/generator-cli");
        vi.mocked(replayResolve).mockResolvedValue(
            makeResolveResult({ phase: "applied", patchesApplied: 2, unresolvedFiles: [] })
        );

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Applied 2 unresolved patch(es)"));
    });

    it("reports applied patches with conflict files", async () => {
        const { replayResolve } = await import("@fern-api/generator-cli");
        vi.mocked(replayResolve).mockResolvedValue(
            makeResolveResult({ phase: "applied", patchesApplied: 1, unresolvedFiles: ["src/foo.ts"] })
        );

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("src/foo.ts"));
        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("fern replay resolve"));
    });

    it("reports committed phase", async () => {
        const { replayResolve } = await import("@fern-api/generator-cli");
        vi.mocked(replayResolve).mockResolvedValue(makeResolveResult({ phase: "committed", patchesResolved: 3 }));

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Resolved 3 patch(es) and committed"));
    });

    it("reports nothing-to-resolve phase", async () => {
        const { replayResolve } = await import("@fern-api/generator-cli");
        vi.mocked(replayResolve).mockResolvedValue(makeResolveResult({ phase: "nothing-to-resolve" }));

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("No unresolved patches found"));
    });

    it("warns about unresolved conflicts in default phase", async () => {
        const { replayResolve } = await import("@fern-api/generator-cli");
        vi.mocked(replayResolve).mockResolvedValue(
            makeResolveResult({ success: false, reason: "unresolved-conflicts", unresolvedFiles: ["src/bar.ts"] })
        );

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.warn).toHaveBeenCalledWith(expect.stringContaining("src/bar.ts"));
    });

    it("throws CliError for unknown failure reason", async () => {
        const { replayResolve } = await import("@fern-api/generator-cli");
        vi.mocked(replayResolve).mockResolvedValue(makeResolveResult({ success: false, reason: "git-error" }));

        const context = createMockContext();
        await expect(cmd.handle(context, baseArgs())).rejects.toThrow(CliError);
    });
});
