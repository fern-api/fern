import type { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, type TaskContext, TaskResult } from "@fern-api/task-context";

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import * as CppDocsGenerator from "../CppDocsGenerator.js";
import { runLibraryDocsGeneration, type StepWrapper } from "../orchestrate.js";
import * as PythonDocsGenerator from "../PythonDocsGenerator.js";

vi.mock("../PythonDocsGenerator.js", async () => {
    const actual = await vi.importActual<typeof import("../PythonDocsGenerator.js")>("../PythonDocsGenerator.js");
    return { ...actual, generate: vi.fn() };
});

vi.mock("../CppDocsGenerator.js", async () => {
    const actual = await vi.importActual<typeof import("../CppDocsGenerator.js")>("../CppDocsGenerator.js");
    return { ...actual, generateCpp: vi.fn() };
});

type LoggerMock = { info: Mock; error: Mock; debug: Mock; warn: Mock; trace: Mock; log: Mock };

function makeLogger(): LoggerMock {
    return {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

function makeContext(logger: LoggerMock = makeLogger()): TaskContext & { logger: LoggerMock } {
    return {
        logger,
        takeOverTerminal: async (run: () => void | Promise<void>) => {
            await run();
        },
        failAndThrow: (message?: string) => {
            throw new Error(message ?? "fail");
        },
        failWithoutThrowing: vi.fn(),
        captureException: vi.fn(),
        getResult: () => TaskResult.Success,
        getLastFailureMessage: () => undefined,
        instrumentPostHogEvent: vi.fn(),
        addInteractiveTask: vi.fn(),
        runInteractiveTask: vi.fn()
    } as unknown as TaskContext & { logger: LoggerMock };
}

function pythonConfig(): docsYml.RawSchemas.LibraryConfiguration {
    return {
        input: { git: "https://github.com/acme/sdk" },
        output: { path: "./docs" },
        lang: "python"
    };
}

function cppConfig(): docsYml.RawSchemas.LibraryConfiguration {
    return {
        input: { git: "https://github.com/acme/cpp" },
        output: { path: "./docs" },
        lang: "cpp"
    };
}

function makeStatus(status: string, extras: Record<string, unknown> = {}) {
    return { status, jobId: "job-1", progress: "", createdAt: "", updatedAt: "", ...extras };
}

/**
 * Routes calls to `globalThis.fetch` based on URL substring so tests can
 * script start → poll → result → S3 download responses for the library
 * docs endpoints without standing up a real server.
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
    let statusIdx = 0;
    const startCalls: unknown[] = [];

    const mockFn = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        const urlStr = String(url);

        if (urlStr.includes("/library-docs/generate") && init?.method === "POST") {
            startCalls.push(init.body ? JSON.parse(String(init.body)) : undefined);
            if (startResponse.ok === false) {
                return {
                    ok: false,
                    status: 401,
                    json: async () => startResponse.body,
                    text: async () => JSON.stringify(startResponse.body)
                };
            }
            return { ok: true, status: 200, json: async () => startResponse.body, text: async () => "" };
        }

        if (urlStr.includes("/library-docs/status/")) {
            const resp = statusResponses[statusIdx++];
            if (!resp || resp.ok === false) {
                return {
                    ok: false,
                    status: 500,
                    json: async () => resp?.body ?? {},
                    text: async () => JSON.stringify(resp?.body ?? {})
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

        return { ok: true, status: 200, json: async () => irResponse ?? { ir: mockPythonIr } };
    });

    return { mockFn, startCalls };
}

const mockPythonIr = {
    rootModule: { name: "sdk", path: "sdk", submodules: [], classes: [], functions: [], attributes: [] }
};
const mockCppIr = {
    rootNamespace: { name: "acme", namespaces: [], classes: [], functions: [], enums: [], typedefs: [] }
};

const DOCS_DIR = AbsoluteFilePath.of("/tmp/docs");

describe("runLibraryDocsGeneration", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ ir: mockPythonIr }),
            text: async () => ""
        }) as unknown as typeof fetch;
        (PythonDocsGenerator.generate as Mock).mockReturnValue({ pageCount: 1 });
        (CppDocsGenerator.generateCpp as Mock).mockReturnValue({ pageCount: 1 });
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.useRealTimers();
    });

    it("rejects when libraries is empty", async () => {
        await expect(
            runLibraryDocsGeneration({
                libraries: {},
                docsDirectoryPath: DOCS_DIR,
                orgId: "org",
                tokenValue: "tok",
                context: makeContext()
            })
        ).rejects.toThrow(/No libraries configured/);
    });

    it("rejects when --library filter does not match any configured library", async () => {
        await expect(
            runLibraryDocsGeneration({
                libraries: { "my-sdk": pythonConfig() },
                library: "nonexistent",
                docsDirectoryPath: DOCS_DIR,
                orgId: "org",
                tokenValue: "tok",
                context: makeContext()
            })
        ).rejects.toThrow(/Library 'nonexistent' not found/);
    });

    it("rejects when a library uses unsupported 'path' input", async () => {
        await expect(
            runLibraryDocsGeneration({
                libraries: {
                    "path-lib": {
                        input: { path: "./local" } as unknown as docsYml.RawSchemas.LibraryInputConfiguration,
                        output: { path: "./docs" },
                        lang: "python"
                    }
                },
                docsDirectoryPath: DOCS_DIR,
                orgId: "org",
                tokenValue: "tok",
                context: makeContext()
            })
        ).rejects.toThrow(/'path' input is not yet supported/);
    });

    it("happy path: start → poll → download IR → generate (Python)", async () => {
        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-1" } },
            statusResponses: [{ body: makeStatus("PENDING") }, { body: makeStatus("COMPLETED") }]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const promise = runLibraryDocsGeneration({
            libraries: { "my-sdk": pythonConfig() },
            docsDirectoryPath: DOCS_DIR,
            orgId: "org",
            tokenValue: "tok-123",
            context: makeContext()
        });

        await vi.advanceTimersByTimeAsync(3000);
        await vi.advanceTimersByTimeAsync(3000);
        await expect(promise).resolves.toEqual({ successful: 1 });

        expect(startCalls.length).toBe(1);
        const startCall = startCalls[0] as Record<string, unknown>;
        expect(startCall.language).toBe("PYTHON");
        expect(startCall.githubUrl).toBe("https://github.com/acme/sdk");
        expect(PythonDocsGenerator.generate).toHaveBeenCalledWith(
            expect.objectContaining({ ir: mockPythonIr, slug: "my-sdk", title: "my-sdk" })
        );
    });

    it("sends the bearer token in the auth header", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-auth" } },
            statusResponses: [{ body: makeStatus("COMPLETED") }]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const promise = runLibraryDocsGeneration({
            libraries: { "my-sdk": pythonConfig() },
            docsDirectoryPath: DOCS_DIR,
            orgId: "org",
            tokenValue: "tok-abc",
            context: makeContext()
        });

        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        const fetchCalls = mockFn.mock.calls as Array<[string, RequestInit | undefined]>;
        const authHeader = fetchCalls
            .filter(([, init]) => init?.headers != null)
            .map(([, init]) => (init?.headers as Record<string, string>)?.Authorization)
            .find(Boolean);
        expect(authHeader).toBe("Bearer tok-abc");
    });

    it("rejects when generation status is FAILED, preserving the server message", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-fail" } },
            statusResponses: [
                { body: makeStatus("FAILED", { error: { code: "PARSE_FAILED", message: "Bad syntax" } }) }
            ]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const promise = runLibraryDocsGeneration({
            libraries: { "my-sdk": pythonConfig() },
            docsDirectoryPath: DOCS_DIR,
            orgId: "org",
            tokenValue: "tok",
            context: makeContext()
        });
        // Attach a no-op handler so the rejection is never "unhandled" while
        // we advance fake timers below.
        promise.catch(() => undefined);
        await vi.advanceTimersByTimeAsync(3000);

        await expect(promise).rejects.toThrow(/Bad syntax/);
        await expect(promise).rejects.toBeInstanceOf(CliError);
    });

    it("rejects with a network error when startLibraryDocsGeneration HTTP-errors", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { error: "UnauthorizedError" }, ok: false },
            statusResponses: []
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        await expect(
            runLibraryDocsGeneration({
                libraries: { "my-sdk": pythonConfig() },
                docsDirectoryPath: DOCS_DIR,
                orgId: "org",
                tokenValue: "tok",
                context: makeContext()
            })
        ).rejects.toThrow(/Failed to start generation/);
    });

    it("maps lang: cpp → CPP and calls generateCpp", async () => {
        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-cpp" } },
            statusResponses: [{ body: makeStatus("COMPLETED", { jobId: "job-cpp" }) }],
            irResponse: { ir: mockCppIr }
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const promise = runLibraryDocsGeneration({
            libraries: { "cpp-lib": cppConfig() },
            docsDirectoryPath: DOCS_DIR,
            orgId: "org",
            tokenValue: "tok",
            context: makeContext()
        });
        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        expect((startCalls[0] as Record<string, unknown>).language).toBe("CPP");
        expect(CppDocsGenerator.generateCpp).toHaveBeenCalledWith(
            expect.objectContaining({ ir: mockCppIr, slug: "cpp-lib" })
        );
    });

    it("respects the library filter — only the named library is generated", async () => {
        const { mockFn, startCalls } = makeMockFetch({
            startResponse: { body: { jobId: "job-f" } },
            statusResponses: [{ body: makeStatus("COMPLETED") }]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const promise = runLibraryDocsGeneration({
            libraries: {
                "sdk-a": pythonConfig(),
                "sdk-b": {
                    input: { git: "https://github.com/acme/sdk-b" },
                    output: { path: "./docs-b" },
                    lang: "python"
                }
            },
            library: "sdk-a",
            docsDirectoryPath: DOCS_DIR,
            orgId: "org",
            tokenValue: "tok",
            context: makeContext()
        });
        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        expect(startCalls.length).toBe(1);
        expect((startCalls[0] as Record<string, unknown>).githubUrl).toBe("https://github.com/acme/sdk");
    });

    it("times out when polling exceeds the deadline", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-timeout" } },
            statusResponses: Array.from({ length: 100 }, () => ({ body: makeStatus("PARSING") }))
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const promise = runLibraryDocsGeneration({
            libraries: { "my-sdk": pythonConfig() },
            docsDirectoryPath: DOCS_DIR,
            orgId: "org",
            tokenValue: "tok",
            context: makeContext()
        });
        promise.catch(() => undefined);

        // Advance well past the 3-minute deadline.
        await vi.advanceTimersByTimeAsync(4 * 60 * 1000);

        await expect(promise).rejects.toThrow(/timed out/);
    });

    it("invokes wrapStep around each long-running step", async () => {
        const { mockFn } = makeMockFetch({
            startResponse: { body: { jobId: "job-wrap" } },
            statusResponses: [{ body: makeStatus("COMPLETED") }]
        });
        globalThis.fetch = mockFn as unknown as typeof fetch;

        const messages: string[] = [];
        const wrapStep: StepWrapper = async ({ message, operation }) => {
            messages.push(message);
            return operation();
        };

        const promise = runLibraryDocsGeneration({
            libraries: { "my-sdk": pythonConfig() },
            docsDirectoryPath: DOCS_DIR,
            orgId: "org",
            tokenValue: "tok",
            context: makeContext(),
            wrapStep
        });
        await vi.advanceTimersByTimeAsync(3000);
        await promise;

        expect(messages.some((m) => m.includes("starting generation"))).toBe(true);
        expect(messages.some((m) => m.includes("generating documentation"))).toBe(true);
        expect(messages.some((m) => m.includes("downloading generated IR"))).toBe(true);
    });
});
