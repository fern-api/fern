import { CliError } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { GenerateCommand } from "../command.js";

// The orchestrator (`runLibraryDocsGeneration`) is unit-tested in
// `@fern-api/library-docs-generator`. These tests cover only the v2
// wrapper's responsibilities: workspace/docs validation and delegation
// to the orchestrator with the correct adapter inputs.
vi.mock("@fern-api/library-docs-generator", () => ({
    runLibraryDocsGeneration: vi.fn()
}));

import { runLibraryDocsGeneration } from "@fern-api/library-docs-generator";

type MockWorkspace = {
    docs: { raw: { libraries?: Record<string, unknown> }; absoluteFilePath?: string } | null;
    org: string;
    absoluteFilePath?: string;
};

function makeContext(workspace: MockWorkspace) {
    const noopLogger = {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
    return {
        stdout: noopLogger,
        stderr: noopLogger,
        cwd: "/tmp",
        loadWorkspaceOrThrow: vi.fn().mockResolvedValue(workspace),
        getTokenOrPrompt: vi.fn().mockResolvedValue({ type: "user", value: "tok-123" }),
        verifyOrgAccess: vi.fn().mockResolvedValue(undefined),
        telemetry: { captureException: vi.fn(), sendEvent: vi.fn() }
    } as unknown as import("../../../../../context/Context.js").Context;
}

describe("GenerateCommand", () => {
    it("throws when the workspace has no docs configuration", async () => {
        const cmd = new GenerateCommand();
        const context = makeContext({ docs: null, org: "test-org" });
        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow(CliError);
    });

    it("throws when docs has no libraries configured", async () => {
        const cmd = new GenerateCommand();
        const context = makeContext({
            docs: { raw: { libraries: undefined }, absoluteFilePath: "/tmp/docs.yml" },
            org: "test-org"
        });
        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow(CliError);
    });

    it("delegates to runLibraryDocsGeneration with adapter inputs", async () => {
        const cmd = new GenerateCommand();
        const context = makeContext({
            docs: {
                raw: { libraries: { "my-sdk": { input: { git: "x" }, output: { path: "./out" }, lang: "python" } } },
                absoluteFilePath: "/tmp/proj/fern/docs.yml"
            },
            org: "test-org",
            absoluteFilePath: "/tmp/proj/fern/fern.yml"
        });
        (runLibraryDocsGeneration as ReturnType<typeof vi.fn>).mockResolvedValue({ successful: 1 });

        await cmd.handle(context, { library: "my-sdk" } as GenerateCommand.Args);

        expect(runLibraryDocsGeneration).toHaveBeenCalledTimes(1);
        const call = (runLibraryDocsGeneration as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
        expect(call).toBeDefined();
        expect(call.library).toBe("my-sdk");
        expect(call.orgId).toBe("test-org");
        expect(call.tokenValue).toBe("tok-123");
        // docsDirectoryPath should be the *directory* of docs.yml, not the file itself.
        expect(call.docsDirectoryPath).toBe("/tmp/proj/fern");
    });

    it("propagates errors thrown by the orchestrator", async () => {
        const cmd = new GenerateCommand();
        const context = makeContext({
            docs: {
                raw: { libraries: { x: { input: { git: "x" }, output: { path: "./out" }, lang: "python" } } },
                absoluteFilePath: "/tmp/docs.yml"
            },
            org: "test-org"
        });
        (runLibraryDocsGeneration as ReturnType<typeof vi.fn>).mockRejectedValue(
            new CliError({ message: "Generation failed", code: CliError.Code.InternalError })
        );
        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow("Generation failed");
    });
});
