import type { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { GenerateCommand } from "../command.js";

vi.mock("@fern-api/library-docs-generator", () => ({
    generate: vi.fn(),
    generateCpp: vi.fn()
}));

vi.mock("../../../../../ui/withSpinner.js", () => ({
    withSpinner: vi.fn(({ operation }: { operation: () => Promise<unknown> }) => operation())
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

type MockWorkspace = {
    docs: { raw: { libraries?: Record<string, unknown> }; absoluteFilePath?: string } | null;
    org: string;
    absoluteFilePath?: string;
};

function createMockContext(workspace: MockWorkspace) {
    return {
        stdout: createMockLogger(),
        stderr: createMockLogger(),
        cwd: "/tmp",
        loadWorkspaceOrThrow: vi.fn().mockResolvedValue(workspace),
        getTokenOrPrompt: vi.fn().mockResolvedValue({ type: "user", value: "tok-123" }),
        verifyOrgAccess: vi.fn().mockResolvedValue(undefined)
    } as unknown as import("../../../../../context/Context.js").Context;
}

function makeWorkspace(overrides: Partial<MockWorkspace> = {}): MockWorkspace {
    return {
        docs: { raw: {}, absoluteFilePath: "/tmp/docs" },
        org: "test-org",
        ...overrides
    };
}

function makePythonLibraryConfig() {
    return {
        input: { git: "https://github.com/acme/sdk" },
        output: { path: "./docs" },
        lang: "python" as const
    };
}

function makeCppLibraryConfig() {
    return {
        input: { git: "https://github.com/acme/cpp" },
        output: { path: "./docs" },
        lang: "cpp" as const
    };
}

/**
 * Creates a mock fetch that routes requests based on URL to simulate the
 * library docs API endpoints and S3 IR download.
 */
function makeMockFetch({
    startResponse,
    statusResponses,
    resultResponse,
    irResponse
}: {
    startResponse: { body: unknown; ok?: boolean };
    statusResponses: { body: unknown; ok?: boolean }[];
    resultResponse?: { body: unknown; ok?: boolean };
    irResponse?: unknown;
}) {
    let statusCallIndex = 0;
    const startCalls: unknown[] = [];

    const mockFn = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        const urlStr = String(url);

        if (urlStr.includes("/library-docs/generate") && init?.method === "POST") {
            const body = init.body ? JSON.parse(String(init.body)) : undefined;
            startCalls.push(body);
            if (startResponse.ok === false) {
                return {
                    ok: false,
                    status: 401,
                    text: async () => JSON.stringify(startResponse.body),
                    json: async () => startResponse.body
                };
            }
            return { ok: true, status: 200, json: async () => startResponse.body, text: async () => "" };
        }

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
            return { ok: true, status: 200, json: async () => resp.body, text: async () => "" };
        }

        if (urlStr.includes("/library-docs/result/")) {
            const resp = resultResponse ?? { body: { resultUrl: "https://s3.example.com/ir.json" }, ok: true };
            return {
                ok: resp.ok !== false,
                status: resp.ok !== false ? 200 : 500,
                json: async () => resp.body,
                text: async () => ""
            };
        }

        // S3 IR download
        return { ok: true, status: 200, json: async () => irResponse ?? { ir: mockPythonIr } };
    });

    return { mockFn, startCalls };
}

function makeStatusBody(status: string, jobId = "job-1") {
    return { status, jobId, progress: "", createdAt: "", updatedAt: "" };
}

const mockPythonIr = {
    rootModule: { name: "sdk", path: "sdk", submodules: [], classes: [], functions: [], attributes: [] }
};

const mockCppIr = {
    rootNamespace: { name: "acme", namespaces: [], classes: [], functions: [], enums: [], typedefs: [] }
};

describe("GenerateCommand", () => {
    let cmd: GenerateCommand;
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ir: mockPythonIr }),
            text: async () => ""
        }) as unknown as typeof fetch;
        cmd = new GenerateCommand();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.useRealTimers();
    });

    it("fails when workspace has no docs configuration", async () => {
        const context = createMockContext(makeWorkspace({ docs: null }));
        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow(CliError);
    });

    it("fails when no libraries are configured in docs", async () => {
        const context = createMockContext(makeWorkspace({ docs: { raw: { libraries: undefined } } }));
        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow(CliError);
    });

    it("fails when libraries object is empty", async () => {
        const context = createMockContext(makeWorkspace({ docs: { raw: { libraries: {} } } }));
        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow(CliError);
    });

    it("fails when specified library is not found", async () => {
        const context = createMockContext(
            makeWorkspace({
                docs: {
                    raw: { libraries: { "my-sdk": makePythonLibraryConfig() } }
                }
            })
        );
        await expect(cmd.handle(context, { library: "nonexistent" } as GenerateCommand.Args)).rejects.toThrow(CliError);
    });

    it("skips library with path input (unsupported)", async () => {
        const context = createMockContext(
            makeWorkspace({
                docs: {
                    raw: {
                        libraries: {
                            "path-lib": { input: { path: "./local" }, output: { path: "./docs" }, lang: "python" }
                        }
                    }
                }
            })
        );
        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow(CliError);
        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("'path' input"));
    });

    it("happy path: python library start → poll → download IR → generate", async () => {
        const { generate } = await import("@fern-api/library-docs-generator");
        (generate as Mock).mockReturnValue({ pageCount: 5 });

        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-1" } },
            statusResponses: [{ body: makeStatusBody("PENDING") }, { body: makeStatusBody("COMPLETED") }]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const context = createMockContext(
            makeWorkspace({
                docs: { raw: { libraries: { "my-sdk": makePythonLibraryConfig() } }, absoluteFilePath: "/tmp/docs" }
            })
        );

        const promise = cmd.handle(context, {} as GenerateCommand.Args);

        // Advance past first poll (PENDING) and second poll (COMPLETED)
        await vi.advanceTimersByTimeAsync(3000);
        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        expect(startCalls.length).toBeGreaterThan(0);
        const startCall = startCalls[0] as Record<string, unknown>;
        expect(startCall.language).toBe("PYTHON");
        expect(startCall.githubUrl).toBe("https://github.com/acme/sdk");

        expect(generate).toHaveBeenCalledWith(
            expect.objectContaining({ ir: mockPythonIr, slug: "my-sdk", title: "my-sdk" })
        );

        expect(context.stderr.info).toHaveBeenCalledWith(expect.stringContaining("Generated library documentation"));
    });

    it("sends auth header with token", async () => {
        const { generate } = await import("@fern-api/library-docs-generator");
        (generate as Mock).mockReturnValue({ pageCount: 1 });

        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-auth" } },
            statusResponses: [{ body: makeStatusBody("COMPLETED") }]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const context = createMockContext(
            makeWorkspace({
                docs: { raw: { libraries: { "my-sdk": makePythonLibraryConfig() } }, absoluteFilePath: "/tmp/docs" }
            })
        );

        const promise = cmd.handle(context, {} as GenerateCommand.Args);
        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        const fetchCalls = mockFn.mock.calls as Array<[string, RequestInit | undefined]>;
        const authHeader = fetchCalls
            .filter(([, init]) => init?.headers != null)
            .map(([, init]) => (init?.headers as Record<string, string>)?.Authorization)
            .find(Boolean);
        expect(authHeader).toBe("Bearer tok-123");
    });

    it("reports failure when generation status is FAILED", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-fail" } },
            statusResponses: [
                {
                    body: {
                        ...makeStatusBody("FAILED", "job-fail"),
                        error: { code: "PARSE_FAILED", message: "Bad syntax" }
                    }
                }
            ]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const context = createMockContext(
            makeWorkspace({
                docs: {
                    raw: { libraries: { "my-sdk": makePythonLibraryConfig() } },
                    absoluteFilePath: "/tmp/docs"
                }
            })
        );

        const promise = cmd.handle(context, {} as GenerateCommand.Args);
        // Attach a no-op handler so the rejection is never "unhandled" while
        // we advance fake timers below. The actual assertion still runs on
        // the original promise via `expect(...).rejects.toThrow(...)`.
        promise.catch(() => undefined);
        await vi.advanceTimersByTimeAsync(3000);
        await expect(promise).rejects.toThrow(CliError);
        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Bad syntax"));
    });

    it("reports failure when startLibraryDocsGeneration returns HTTP error", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { error: "UnauthorizedError" }, ok: false },
            statusResponses: []
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const context = createMockContext(
            makeWorkspace({
                docs: { raw: { libraries: { "my-sdk": makePythonLibraryConfig() } }, absoluteFilePath: "/tmp/docs" }
            })
        );

        await expect(cmd.handle(context, {} as GenerateCommand.Args)).rejects.toThrow(CliError);
        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("Failed to start generation"));
    });

    it("maps cpp language correctly and calls generateCpp", async () => {
        const { generateCpp } = await import("@fern-api/library-docs-generator");
        (generateCpp as Mock).mockReturnValue({ pageCount: 3 });

        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-cpp" } },
            statusResponses: [{ body: makeStatusBody("COMPLETED", "job-cpp") }],
            irResponse: { ir: mockCppIr }
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const context = createMockContext(
            makeWorkspace({
                docs: { raw: { libraries: { "cpp-lib": makeCppLibraryConfig() } }, absoluteFilePath: "/tmp/docs" }
            })
        );

        const promise = cmd.handle(context, {} as GenerateCommand.Args);
        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        const startCall = startCalls[0] as Record<string, unknown>;
        expect(startCall.language).toBe("CPP");
        expect(generateCpp).toHaveBeenCalledWith(expect.objectContaining({ ir: mockCppIr, slug: "cpp-lib" }));
    });

    it("filters to the specified library when --library flag is used", async () => {
        const { generate } = await import("@fern-api/library-docs-generator");
        (generate as Mock).mockReturnValue({ pageCount: 1 });

        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-filtered" } },
            statusResponses: [{ body: makeStatusBody("COMPLETED") }]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const context = createMockContext(
            makeWorkspace({
                docs: {
                    raw: {
                        libraries: {
                            "sdk-a": makePythonLibraryConfig(),
                            "sdk-b": {
                                input: { git: "https://github.com/acme/sdk-b" },
                                output: { path: "./docs-b" },
                                lang: "python" as const
                            }
                        }
                    },
                    absoluteFilePath: "/tmp/docs"
                }
            })
        );

        const promise = cmd.handle(context, { library: "sdk-a" } as GenerateCommand.Args);
        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        // Only one start call should be made (for sdk-a only)
        expect(startCalls.length).toBe(1);
        const startCall = startCalls[0] as Record<string, unknown>;
        expect(startCall.githubUrl).toBe("https://github.com/acme/sdk");
    });

    it("times out when polling exceeds the deadline", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-timeout" } },
            statusResponses: Array.from({ length: 100 }, () => ({ body: makeStatusBody("PENDING") }))
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const context = createMockContext(
            makeWorkspace({
                docs: { raw: { libraries: { "my-sdk": makePythonLibraryConfig() } }, absoluteFilePath: "/tmp/docs" }
            })
        );

        const promise = cmd.handle(context, {} as GenerateCommand.Args);
        // Attach a no-op handler so the rejection is never "unhandled" while
        // we advance fake timers below.
        promise.catch(() => undefined);
        // Advance past the 3-minute timeout (3 * 60 * 1000 ms)
        await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 3000);
        await expect(promise).rejects.toThrow(CliError);
        expect(context.stderr.error).toHaveBeenCalledWith(expect.stringContaining("timed out"));
    });
});
