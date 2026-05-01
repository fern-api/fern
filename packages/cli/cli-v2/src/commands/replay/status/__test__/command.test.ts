import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatusCommand } from "../command.js";

vi.mock("@fern-api/generator-cli", () => ({
    replayStatus: vi.fn()
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

function baseArgs(overrides: Partial<StatusCommand.Args> = {}): StatusCommand.Args {
    return {
        directory: ".",
        verbose: false,
        ...overrides
    } as StatusCommand.Args;
}

type StatusResult = ReturnType<typeof import("@fern-api/generator-cli").replayStatus>;
type StatusPatch = StatusResult["patches"][number];

function makePatch(id: string, overrides: Partial<StatusPatch> = {}): StatusPatch {
    return {
        id,
        type: "modified",
        message: "fix types",
        author: "dev",
        sha: "abc123",
        files: [],
        fileCount: 0,
        ...overrides
    };
}

function makeStatusResult(overrides: Partial<StatusResult> = {}): StatusResult {
    return {
        initialized: true,
        generationCount: 0,
        lastGeneration: undefined,
        patches: [],
        unresolvedCount: 0,
        excludePatterns: [],
        ...overrides
    };
}

describe("StatusCommand", () => {
    let cmd: StatusCommand;

    beforeEach(() => {
        vi.clearAllMocks();
        cmd = new StatusCommand();
    });

    it("reports not initialized", async () => {
        const { replayStatus } = await import("@fern-api/generator-cli");
        vi.mocked(replayStatus).mockReturnValue(makeStatusResult({ initialized: false }));

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("not initialized"));
    });

    it("shows patch count and generation count", async () => {
        const { replayStatus } = await import("@fern-api/generator-cli");
        vi.mocked(replayStatus).mockReturnValue(
            makeStatusResult({ patches: [makePatch("patch-abc", { fileCount: 2 })], generationCount: 5 })
        );

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(
            expect.stringContaining("1 customization(s) tracked, 5 generation(s)")
        );
    });

    it("shows last generation info when present", async () => {
        const { replayStatus } = await import("@fern-api/generator-cli");
        vi.mocked(replayStatus).mockReturnValue(
            makeStatusResult({
                generationCount: 1,
                lastGeneration: {
                    sha: "deadbeef",
                    timestamp: "2024-01-01",
                    cliVersion: "0.30.0",
                    generatorVersions: {}
                }
            })
        );

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("deadbeef"));
    });

    it("warns about unresolved patches", async () => {
        const { replayStatus } = await import("@fern-api/generator-cli");
        vi.mocked(replayStatus).mockReturnValue(
            makeStatusResult({
                patches: [makePatch("patch-abc", { status: "unresolved" })],
                generationCount: 1,
                unresolvedCount: 1
            })
        );

        const context = createMockContext();
        await cmd.handle(context, baseArgs());

        expect(context.stderr.warn).toHaveBeenCalledWith(expect.stringContaining("unresolved conflicts"));
    });

    it("truncates patch list when not verbose and more than 10 patches", async () => {
        const { replayStatus } = await import("@fern-api/generator-cli");
        const patches = Array.from({ length: 12 }, (_, i) =>
            makePatch(`patch-${i.toString().padStart(3, "0")}`, { message: `patch ${i}` })
        );
        vi.mocked(replayStatus).mockReturnValue(makeStatusResult({ patches, generationCount: 1 }));

        const context = createMockContext();
        await cmd.handle(context, baseArgs({ verbose: false }));

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("2 more"));
    });
});
