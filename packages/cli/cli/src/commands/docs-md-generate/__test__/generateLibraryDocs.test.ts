import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn()
}));

vi.mock("@fern-api/core", () => ({
    createFdrService: vi.fn()
}));

vi.mock("@fern-api/library-docs-generator", () => ({
    generate: vi.fn()
}));

import { createFdrService } from "@fern-api/core";
import { generate } from "@fern-api/library-docs-generator";
import { askToLogin } from "@fern-api/login";
import { type GenerateLibraryDocsOptions, generateLibraryDocs } from "../generateLibraryDocs.js";

function makeMockCliContext() {
    const logs: string[] = [];
    const errors: string[] = [];
    const fail = (...args: unknown[]): never => {
        const msg = String(args[0] ?? "");
        errors.push(msg);
        throw new Error(msg);
    };
    return {
        logs,
        errors,
        failAndThrow: vi.fn(fail),
        runTask: vi.fn(
            async (
                fn: (ctx: {
                    logger: { info: (m: string) => void };
                    failAndThrow: (...args: unknown[]) => never;
                }) => unknown
            ) => {
                return fn({
                    logger: { info: (m: string) => logs.push(m) },
                    failAndThrow: fail
                });
            }
        ),
        logger: { info: (m: string) => logs.push(m) }
    };
}

// No real I/O occurs against this path — generate() is mocked,
// so it's only used for path resolution in the function under test.
function makeMockProject({
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

function makeMockFdr({
    startResponse,
    statusResponses,
    resultResponse
}: {
    startResponse: unknown;
    statusResponses: unknown[];
    resultResponse?: unknown;
}) {
    let statusCallIndex = 0;
    return {
        docs: {
            v2: {
                write: {
                    startLibraryDocsGeneration: vi.fn().mockResolvedValue(startResponse),
                    getLibraryDocsGenerationStatus: vi.fn().mockImplementation(async () => {
                        return statusResponses[statusCallIndex++];
                    }),
                    getLibraryDocsResult: vi
                        .fn()
                        .mockResolvedValue(
                            resultResponse ?? { ok: true, body: { resultUrl: "https://s3.example.com/ir.json" } }
                        )
                }
            }
        }
    };
}

const mockIr = {
    rootModule: { name: "sdk", path: "sdk", submodules: [], classes: [], functions: [], attributes: [] }
};

describe("generateLibraryDocs", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ir: mockIr })
        }) as unknown as typeof fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.useRealTimers();
    });

    function advancePolling() {
        return vi.advanceTimersByTimeAsync(5000);
    }

    it("fails when no docs workspace is found", async () => {
        const ctx = makeMockCliContext();
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
        const ctx = makeMockCliContext();
        const project = makeMockProject({ libraries: undefined });

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: undefined
            })
        ).rejects.toThrow("No libraries configured");
    });

    it("fails when specified library is not found", async () => {
        const ctx = makeMockCliContext();
        const project = makeMockProject({
            libraries: {
                "my-sdk": { input: { git: "https://github.com/acme/sdk" }, output: { path: "./docs" }, lang: "python" }
            }
        });

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: "nonexistent"
            })
        ).rejects.toThrow("Library 'nonexistent' not found");
    });

    it("fails when library uses path input", async () => {
        const ctx = makeMockCliContext();
        const project = makeMockProject({
            libraries: {
                "my-sdk": { input: { path: "./local" }, output: { path: "./docs" }, lang: "python" }
            }
        });
        (askToLogin as Mock).mockResolvedValue({ type: "user", value: "tok" });

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: undefined
            })
        ).rejects.toThrow("'path' input which is not yet supported");
    });

    it("happy path: start → poll → fetch IR → generate", async () => {
        const ctx = makeMockCliContext();
        const project = makeMockProject({
            libraries: {
                "my-sdk": {
                    input: { git: "https://github.com/acme/sdk" },
                    output: { path: "./docs" },
                    lang: "python"
                }
            }
        });

        (askToLogin as Mock).mockResolvedValue({ type: "user", value: "tok-123" });

        const mockFdr = makeMockFdr({
            startResponse: { ok: true, body: { jobId: "job-1" } },
            statusResponses: [
                { ok: true, body: { status: "PENDING" } },
                { ok: true, body: { status: "PARSING" } },
                { ok: true, body: { status: "COMPLETED" } }
            ]
        });
        (createFdrService as Mock).mockReturnValue(mockFdr);

        (generate as Mock).mockReturnValue({
            navigation: [],
            rootPageId: "my-sdk/sdk.mdx",
            writtenFiles: [],
            pageCount: 1,
            navigationFilePath: "/tmp/docs/_navigation.yml"
        });

        const promise = generateLibraryDocs({
            project: project as unknown as GenerateLibraryDocsOptions["project"],
            cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
            library: undefined
        });

        await advancePolling();
        await advancePolling();
        await advancePolling();

        await promise;

        expect(createFdrService).toHaveBeenCalledWith({ token: "tok-123" });

        const startCall = mockFdr.docs.v2.write.startLibraryDocsGeneration.mock.calls[0]?.[0];
        expect(startCall.language).toBe("PYTHON");
        expect(startCall.githubUrl).toBe("https://github.com/acme/sdk");

        expect(generate).toHaveBeenCalledWith(
            expect.objectContaining({
                ir: mockIr,
                slug: "my-sdk",
                title: "my-sdk"
            })
        );

        expect(ctx.logs.some((l: string) => l.includes("Generated 1 pages"))).toBe(true);
    });

    it("reports failure when generation status is FAILED", async () => {
        const ctx = makeMockCliContext();
        const project = makeMockProject({
            libraries: {
                "my-sdk": {
                    input: { git: "https://github.com/acme/sdk" },
                    output: { path: "./docs" },
                    lang: "python"
                }
            }
        });

        (askToLogin as Mock).mockResolvedValue({ type: "user", value: "tok" });

        const mockFdr = makeMockFdr({
            startResponse: { ok: true, body: { jobId: "job-fail" } },
            statusResponses: [
                { ok: true, body: { status: "FAILED", error: { code: "PARSE_FAILED", message: "Bad syntax" } } }
            ]
        });
        (createFdrService as Mock).mockReturnValue(mockFdr);

        const promise = generateLibraryDocs({
            project: project as unknown as GenerateLibraryDocsOptions["project"],
            cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
            library: undefined
        });

        const expectation = expect(promise).rejects.toThrow("Generation failed");

        await advancePolling();
        await expectation;

        expect(ctx.errors.some((e: string) => e.includes("Bad syntax"))).toBe(true);
    });

    it("reports failure when startLibraryDocsGeneration fails", async () => {
        const ctx = makeMockCliContext();
        const project = makeMockProject({
            libraries: {
                "my-sdk": {
                    input: { git: "https://github.com/acme/sdk" },
                    output: { path: "./docs" },
                    lang: "python"
                }
            }
        });

        (askToLogin as Mock).mockResolvedValue({ type: "user", value: "tok" });

        const mockFdr = makeMockFdr({
            startResponse: { ok: false, error: { error: "UnauthorizedError" } },
            statusResponses: []
        });
        (createFdrService as Mock).mockReturnValue(mockFdr);

        await expect(
            generateLibraryDocs({
                project: project as unknown as GenerateLibraryDocsOptions["project"],
                cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
                library: undefined
            })
        ).rejects.toThrow("Failed to start generation");
    });

    it("maps cpp language correctly", async () => {
        const ctx = makeMockCliContext();
        const project = makeMockProject({
            libraries: {
                "cpp-lib": {
                    input: { git: "https://github.com/acme/cpp" },
                    output: { path: "./docs" },
                    lang: "cpp"
                }
            }
        });

        (askToLogin as Mock).mockResolvedValue({ type: "user", value: "tok" });

        const mockFdr = makeMockFdr({
            startResponse: { ok: true, body: { jobId: "job-cpp" } },
            statusResponses: [{ ok: true, body: { status: "COMPLETED" } }]
        });
        (createFdrService as Mock).mockReturnValue(mockFdr);

        (generate as Mock).mockReturnValue({
            navigation: [],
            rootPageId: "cpp-lib/lib.mdx",
            writtenFiles: [],
            pageCount: 0,
            navigationFilePath: "/tmp/docs/_navigation.yml"
        });

        const promise = generateLibraryDocs({
            project: project as unknown as GenerateLibraryDocsOptions["project"],
            cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
            library: undefined
        });

        await advancePolling();
        await promise;

        const startCall = mockFdr.docs.v2.write.startLibraryDocsGeneration.mock.calls[0]?.[0];
        expect(startCall.language).toBe("CPP");
    });
});
