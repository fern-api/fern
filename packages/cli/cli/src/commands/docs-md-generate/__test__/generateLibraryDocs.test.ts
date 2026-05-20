import { describe, expect, it, type Mock, vi } from "vitest";

// Per-library orchestration is unit-tested in `@fern-api/library-docs-generator`.
// These tests cover only the v1 wrapper: workspace validation, auth flow,
// and delegation to the orchestrator.
vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn()
}));

vi.mock("@fern-api/library-docs-generator", () => ({
    runLibraryDocsGeneration: vi.fn()
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
    it("fails when no docs workspace is found", async () => {
        const ctx = makeCliContext();
        const project = { config: { organization: "org" }, docsWorkspaces: undefined };

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: undefined
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
                library: undefined
            })
        ).rejects.toThrow("No libraries configured");
    });

    it("fails when authentication returns null", async () => {
        const ctx = makeCliContext();
        const project = makeProject({
            libraries: { "my-sdk": { input: { git: "https://x" }, output: { path: "./d" }, lang: "python" } }
        });
        (askToLogin as Mock).mockResolvedValue(null);

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: undefined
            })
        ).rejects.toThrow("Failed to authenticate");
    });

    it("delegates to runLibraryDocsGeneration with the workspace's libraries and token", async () => {
        const ctx = makeCliContext();
        const project = makeProject({
            libraries: { "my-sdk": { input: { git: "https://x" }, output: { path: "./d" }, lang: "python" } }
        });
        (askToLogin as Mock).mockResolvedValue({ type: "user", value: "tok-xyz" });
        (runLibraryDocsGeneration as Mock).mockResolvedValue({ successful: 1 });

        await generateLibraryDocs({
            project: project as unknown as GenerateLibraryDocsOptions["project"],
            cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
            library: "my-sdk"
        });

        expect(runLibraryDocsGeneration).toHaveBeenCalledTimes(1);
        const call = (runLibraryDocsGeneration as Mock).mock.calls[0]?.[0];
        expect(call).toBeDefined();
        expect(call.library).toBe("my-sdk");
        expect(call.orgId).toBe("test-org");
        expect(call.tokenValue).toBe("tok-xyz");
        expect(call.docsDirectoryPath).toBe("/home/user/project/fern");
    });
});
