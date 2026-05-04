import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgetCommand } from "../command.js";

vi.mock("@fern-api/generator-cli", () => ({
    replayForget: vi.fn()
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

function baseArgs(overrides: Partial<ForgetCommand.Args> = {}): ForgetCommand.Args {
    return {
        args: [],
        "dry-run": false,
        yes: true,
        all: false,
        ...overrides
    } as ForgetCommand.Args;
}

type ForgetResult = ReturnType<typeof import("@fern-api/generator-cli").replayForget>;

function makePatch(id: string, message: string) {
    return { id, message, files: [], diffstat: { additions: 1, deletions: 0 } };
}

function makeForgetResult(overrides: Partial<ForgetResult> = {}): ForgetResult {
    return {
        initialized: true,
        removed: [],
        remaining: 0,
        notFound: false,
        alreadyForgotten: [],
        totalPatches: 0,
        warnings: [],
        ...overrides
    };
}

describe("ForgetCommand", () => {
    let cmd: ForgetCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new ForgetCommand();
    });

    describe("--all mode", () => {
        it("prints removed patches", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget).mockReturnValue(
                makeForgetResult({ removed: [makePatch("patch-abc", "fix types")], totalPatches: 1 })
            );

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ all: true }));

            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Removed 1 patch(es)"));
            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("patch-abc"));
        });

        it("reports not initialized", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget).mockReturnValue(makeForgetResult({ initialized: false }));

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ all: true }));

            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("not initialized"));
        });

        it("reports no patches to remove when list is empty", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget).mockReturnValue(makeForgetResult());

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ all: true }));

            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("No patches to remove"));
        });
    });

    describe("patch ID mode", () => {
        it("removes specified patch IDs", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget).mockReturnValue(
                makeForgetResult({ removed: [makePatch("patch-abc123", "fix")], remaining: 2, totalPatches: 3 })
            );

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ args: ["patch-abc123"] }));

            expect(replayForget).toHaveBeenCalledWith(
                expect.objectContaining({ options: expect.objectContaining({ patchIds: ["patch-abc123"] }) })
            );
            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("patch-abc123"));
        });

        it("handles already-forgotten IDs", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget).mockReturnValue(makeForgetResult({ alreadyForgotten: ["patch-old"] }));

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ args: ["patch-old"] }));

            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Already forgotten"));
        });
    });

    describe("mixed args (error case)", () => {
        it("throws CliError when multiple non-patch-id args are provided", async () => {
            const context = createMockContext();
            await expect(cmd.handle(context, baseArgs({ args: ["some-pattern", "another-arg"] }))).rejects.toThrow(
                CliError
            );
        });
    });

    describe("search/pattern mode", () => {
        it("lists matched patches and removes after confirmation", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget)
                .mockReturnValueOnce(
                    makeForgetResult({ matched: [makePatch("patch-xyz", "add field")], totalPatches: 1 })
                )
                .mockReturnValueOnce(makeForgetResult({ removed: [makePatch("patch-xyz", "add field")] }));

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ args: ["add field"], yes: true }));

            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("1 patch(es) matched"));
            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Removed 1 patch(es)"));
        });

        it("reports no matches for unknown pattern", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget).mockReturnValue(makeForgetResult({ notFound: true }));

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ args: ["nonexistent"] }));

            expect(context.stderr.info).toHaveBeenCalledWith(
                expect.stringContaining('No patches matching "nonexistent"')
            );
        });

        it("dry-run does not remove", async () => {
            const { replayForget } = await import("@fern-api/generator-cli");
            vi.mocked(replayForget).mockReturnValue(
                makeForgetResult({ matched: [makePatch("patch-abc", "fix")], remaining: 1, totalPatches: 1 })
            );

            const context = createMockContext();
            await cmd.handle(context, baseArgs({ "dry-run": true, args: ["fix"] }));

            expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Dry run"));
            // replayForget should only be called once (for listing), not again for removal
            expect(replayForget).toHaveBeenCalledTimes(1);
        });
    });
});
