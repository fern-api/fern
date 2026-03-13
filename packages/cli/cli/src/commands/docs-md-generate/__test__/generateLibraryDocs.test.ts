import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn()
}));

vi.mock("@fern-api/library-docs-generator", () => ({
    generate: vi.fn(),
    generateCpp: vi.fn()
}));

import { generate, generateCpp } from "@fern-api/library-docs-generator";
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
                    logger: { info: (m: string) => void; debug: (m: string) => void };
                    failAndThrow: (...args: unknown[]) => never;
                    runInteractiveTask: (
                        { name }: { name: string },
                        taskFn: (interactiveCtx: {
                            logger: { debug: (m: string) => void };
                            setSubtitle: (subtitle: string) => void;
                            failAndThrow: (...args: unknown[]) => never;
                        }) => Promise<unknown>
                    ) => Promise<boolean>;
                }) => unknown
            ) => {
                return fn({
                    logger: {
                        info: (m: string) => logs.push(m),
                        debug: (m: string) => logs.push(`[DEBUG] ${m}`)
                    },
                    failAndThrow: fail,
                    runInteractiveTask: vi.fn(async ({ name }, taskFn) => {
                        logs.push(`Starting task: ${name}`);
                        await taskFn({
                            logger: {
                                info: (m: string) => logs.push(m),
                                debug: (m: string) => logs.push(`[DEBUG] ${m}`)
                            },
                            setSubtitle: (subtitle: string) => logs.push(`[SUBTITLE] ${subtitle}`),
                            failAndThrow: fail
                        });
                        return true;
                    })
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

/**
 * Creates a mock fetch that routes requests based on URL to simulate the
 * library docs API endpoints and S3 IR download.
 *
 * The new oRPC-style client uses plain fetch, so we intercept all fetch calls
 * and dispatch based on the URL pattern.
 */
function makeMockFetch({
    startResponse,
    statusResponses,
    resultResponse,
    irResponse
}: {
    /** Direct return value for POST /library-docs/generate */
    startResponse: { body: unknown; ok?: boolean };
    /** Sequential return values for GET /library-docs/status/* */
    statusResponses: { body: unknown; ok?: boolean }[];
    /** Return value for GET /library-docs/result/* */
    resultResponse?: { body: unknown; ok?: boolean };
    /** Return value for the S3 IR download */
    irResponse?: unknown;
}) {
    let statusCallIndex = 0;
    const startCalls: unknown[] = [];

    const mockFn = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        const urlStr = String(url);

        // POST /library-docs/generate
        if (urlStr.includes("/library-docs/generate") && init?.method === "POST") {
            const body = init.body ? JSON.parse(String(init.body)) : undefined;
            startCalls.push(body);
            const resp = startResponse;
            if (resp.ok === false) {
                return {
                    ok: false,
                    status: 401,
                    text: async () => JSON.stringify(resp.body),
                    json: async () => resp.body
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => resp.body,
                text: async () => JSON.stringify(resp.body)
            };
        }

        // GET /library-docs/status/*
        if (urlStr.includes("/library-docs/status/")) {
            const resp = statusResponses[statusCallIndex++];
            if (!resp || resp.ok === false) {
                return {
                    ok: false,
                    status: 500,
                    text: async () => JSON.stringify(resp?.body ?? {}),
                    json: async () => resp?.body ?? {}
                };
            }
            return {
                ok: true,
                status: 200,
                json: async () => resp.body,
                text: async () => JSON.stringify(resp.body)
            };
        }

        // GET /library-docs/result/*
        if (urlStr.includes("/library-docs/result/")) {
            const resp = resultResponse ?? { body: { resultUrl: "https://s3.example.com/ir.json" }, ok: true };
            return {
                ok: resp.ok !== false,
                status: resp.ok !== false ? 200 : 500,
                json: async () => resp.body,
                text: async () => JSON.stringify(resp.body)
            };
        }

        // S3 IR download (any other URL)
        return {
            ok: true,
            status: 200,
            json: async () => irResponse ?? { ir: mockIr }
        };
    });

    return { mockFn, startCalls };
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
        // Default fetch mock — individual tests override via makeMockFetch
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

        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-1" } },
            statusResponses: [
                { body: { status: "PENDING", jobId: "job-1", progress: "", createdAt: "", updatedAt: "" } },
                { body: { status: "PARSING", jobId: "job-1", progress: "", createdAt: "", updatedAt: "" } },
                { body: { status: "COMPLETED", jobId: "job-1", progress: "", createdAt: "", updatedAt: "" } }
            ]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

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

        // Verify the start call sent correct language and githubUrl
        expect(startCalls.length).toBeGreaterThan(0);
        const startCall = startCalls[0] as Record<string, unknown>;
        expect(startCall.language).toBe("PYTHON");
        expect(startCall.githubUrl).toBe("https://github.com/acme/sdk");

        // Verify the fetch was called with auth header containing the token
        const fetchCalls = mockFn.mock.calls as Array<[string, RequestInit | undefined]>;
        const authHeaders = fetchCalls
            .filter(([, init]) => init?.headers != null)
            .map(([, init]) => (init?.headers as Record<string, string>)?.Authorization);
        expect(authHeaders.some((h: string | undefined) => h === "Bearer tok-123")).toBe(true);

        expect(generate).toHaveBeenCalledWith(
            expect.objectContaining({
                ir: mockIr,
                slug: "my-sdk",
                title: "my-sdk"
            })
        );

        expect(ctx.logs.some((l: string) => l.includes("Generated library documentation for 1 libraries"))).toBe(true);
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

        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-fail" } },
            statusResponses: [
                {
                    body: {
                        status: "FAILED",
                        jobId: "job-fail",
                        progress: "",
                        error: { code: "PARSE_FAILED", message: "Bad syntax" },
                        createdAt: "",
                        updatedAt: ""
                    }
                }
            ]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

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

        const { mockFn } = makeMockFetch({
            startResponse: { body: { error: "UnauthorizedError" }, ok: false },
            statusResponses: []
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

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

        const cppMockIr = {
            rootNamespace: { name: "acme", namespaces: [], classes: [], functions: [], enums: [], typedefs: [] }
        };
        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-cpp" } },
            statusResponses: [
                { body: { status: "COMPLETED", jobId: "job-cpp", progress: "", createdAt: "", updatedAt: "" } }
            ],
            irResponse: { ir: cppMockIr }
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        (generateCpp as Mock).mockReturnValue({
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

        expect(startCalls.length).toBeGreaterThan(0);
        const startCall = startCalls[0] as Record<string, unknown>;
        expect(startCall.language).toBe("CPP");
    });
});
