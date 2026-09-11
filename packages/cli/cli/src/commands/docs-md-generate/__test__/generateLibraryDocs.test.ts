import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Per-library orchestration is unit-tested in `@fern-api/library-docs-generator`.
// These tests cover only the v1 wrapper: workspace validation, delegation to
// the orchestrator (local by default), and authentication when --remote is set.
vi.mock("@fern-api/library-docs-generator", () => ({
    runLibraryDocsGeneration: vi.fn()
}));

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn()
}));

import { runLibraryDocsGeneration } from "@fern-api/library-docs-generator";
import { askToLogin } from "@fern-api/login";
import { type GenerateLibraryDocsOptions, generateLibraryDocs } from "../generateLibraryDocs.js";

function makeCliContext() {
    const logs: string[] = [];
    const fail = (...args: unknown[]): never => {
        throw new Error(String(args[0] ?? ""));
    };
    return {
        logs,
        failAndThrow: vi.fn(fail),
        runTask: vi.fn(
            async (
                fn: (ctx: {
                    logger: { info: (m: string) => void; debug: (m: string) => void; error: (m: string) => void };
                    failAndThrow: typeof fail;
                }) => unknown
            ) =>
                fn({
                    logger: {
                        info: (m: string) => logs.push(m),
                        debug: (m: string) => logs.push(`[DEBUG] ${m}`),
                        error: (m: string) => logs.push(`[ERROR] ${m}`)
                    },
                    failAndThrow: fail
                })
        ),
        logger: { info: (m: string) => logs.push(m) }
    };
}

function makeProject({
    libraries,
    absoluteFilePath = "/home/user/project/fern"
}: {
    libraries?: Record<string, unknown> | undefined;
    absoluteFilePath?: string;
}) {
    return {
        config: { organization: "test-org" },
        docsWorkspaces: {
            absoluteFilePath,
            config: { libraries }
        }
    };
}

describe("generateLibraryDocs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("fails when no docs workspace is found", async () => {
        const ctx = makeCliContext();
        const project = { config: { organization: "org" }, docsWorkspaces: undefined };

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: undefined,
                remote: false
            })
        ).rejects.toThrow("No docs workspace found");
    });

    it("fails when no libraries are configured", async () => {
        const ctx = makeCliContext();
        const project = makeProject({ libraries: undefined });

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: undefined,
                remote: false
            })
        ).rejects.toThrow("No libraries configured");
    });

    it("delegates to runLibraryDocsGeneration without any authentication by default", async () => {
        const ctx = makeCliContext();
        const project = makeProject({
            libraries: { "my-sdk": { input: { git: "https://x" }, output: { path: "./d" }, lang: "python" } }
        });
        (runLibraryDocsGeneration as Mock).mockResolvedValue({ successful: 1 });

        await generateLibraryDocs({
            project: project as unknown as GenerateLibraryDocsOptions["project"],
            cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
            library: "my-sdk",
            remote: false
        });

        expect(runLibraryDocsGeneration).toHaveBeenCalledTimes(1);
        const call = (runLibraryDocsGeneration as Mock).mock.calls[0]?.[0];
        expect(call).toBeDefined();
        expect(call.library).toBe("my-sdk");
        expect(call.docsDirectoryPath).toBe("/home/user/project/fern");
        expect(call.remote).toBe(false);
        // Local (default) generation: no token or org is threaded through and
        // the command never prompts for authentication.
        expect(call.tokenValue).toBeUndefined();
        expect(call.orgId).toBeUndefined();
        expect(askToLogin).not.toHaveBeenCalled();
    });

    it("authenticates and forwards token/org when --remote is set", async () => {
        const ctx = makeCliContext();
        const project = makeProject({
            libraries: { "my-sdk": { input: { git: "https://x" }, output: { path: "./d" }, lang: "python" } }
        });
        (runLibraryDocsGeneration as Mock).mockResolvedValue({ successful: 1 });
        (askToLogin as Mock).mockResolvedValue({ type: "user", value: "tok-remote" });

        await generateLibraryDocs({
            project: project as unknown as GenerateLibraryDocsOptions["project"],
            cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
            library: "my-sdk",
            remote: true
        });

        expect(askToLogin).toHaveBeenCalledTimes(1);
        const call = (runLibraryDocsGeneration as Mock).mock.calls[0]?.[0];
        expect(call.remote).toBe(true);
        expect(call.tokenValue).toBe("tok-remote");
        expect(call.orgId).toBe("test-org");
    });
});
