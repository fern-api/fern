import type { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import * as GitHub from "@fern-api/github";
import { CliError, type TaskContext, TaskResult } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import * as CppDocsGenerator from "../CppDocsGenerator.js";
import * as LocalParserRunner from "../LocalParserRunner.js";
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

vi.mock("../LocalParserRunner.js", () => ({
    runLocalParser: vi.fn()
}));

vi.mock("@fern-api/github", async () => {
    const actual = await vi.importActual<typeof import("@fern-api/github")>("@fern-api/github");
    return { ...actual, cloneRepositoryAtRef: vi.fn(), resolveRepositorySubpath: vi.fn() };
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

function pathConfig(): docsYml.RawSchemas.LibraryConfiguration {
    return {
        input: { path: "./local-src" } as unknown as docsYml.RawSchemas.LibraryInputConfiguration,
        output: { path: "./docs" },
        lang: "python"
    };
}

const mockPythonIr = {
    rootModule: { name: "sdk", path: "sdk", submodules: [], classes: [], functions: [], attributes: [] }
};
const mockCppIr = {
    rootNamespace: { name: "acme", namespaces: [], classes: [], functions: [], enums: [], typedefs: [] }
};

const DOCS_DIR = AbsoluteFilePath.of("/tmp/docs");

function gitConfig(): docsYml.RawSchemas.LibraryConfiguration {
    return {
        input: { git: "https://github.com/acme/sdk" },
        output: { path: "./docs" },
        lang: "python"
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

describe("runLibraryDocsGeneration", () => {
    let originalFetch: typeof globalThis.fetch;
    let fetchSpy: Mock;

    beforeEach(() => {
        vi.clearAllMocks();
        originalFetch = globalThis.fetch;
        // Generation is local by default: any fetch call outside the explicit
        // --remote tests is a regression, so the spy rejects and tests assert
        // it was never invoked.
        fetchSpy = vi.fn().mockRejectedValue(new Error("unexpected network request"));
        globalThis.fetch = fetchSpy as unknown as typeof fetch;
        (PythonDocsGenerator.generate as Mock).mockReturnValue({ pageCount: 1 });
        (CppDocsGenerator.generateCpp as Mock).mockReturnValue({ pageCount: 1 });
        (GitHub.cloneRepositoryAtRef as Mock).mockResolvedValue("/tmp/clones/repo");
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    it("rejects when libraries is empty", async () => {
        await expect(
            runLibraryDocsGeneration({
                libraries: {},
                docsDirectoryPath: DOCS_DIR,
                context: makeContext()
            })
        ).rejects.toThrow(/No libraries configured/);
    });

    it("rejects when --library filter does not match any configured library", async () => {
        await expect(
            runLibraryDocsGeneration({
                libraries: { "my-sdk": pathConfig() },
                library: "nonexistent",
                docsDirectoryPath: DOCS_DIR,
                context: makeContext()
            })
        ).rejects.toThrow(/Library 'nonexistent' not found/);
    });

    it("parses a 'path' input library locally and generates without any network request (Python)", async () => {
        (LocalParserRunner.runLocalParser as Mock).mockResolvedValue(mockPythonIr);

        await expect(
            runLibraryDocsGeneration({
                libraries: { "my-sdk": pathConfig() },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext()
            })
        ).resolves.toEqual({ successful: 1 });

        expect(LocalParserRunner.runLocalParser).toHaveBeenCalledTimes(1);
        const call = (LocalParserRunner.runLocalParser as Mock).mock.calls[0]?.[0] as Record<string, unknown>;
        expect(call.language).toBe("PYTHON");
        expect(String(call.sourcePath)).toBe("/tmp/docs/local-src");
        expect(PythonDocsGenerator.generate).toHaveBeenCalledWith(
            expect.objectContaining({ ir: mockPythonIr, slug: "my-sdk", title: "my-sdk" })
        );
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("clones a git input locally, forwarding ref and subpath to the parser, without any network request", async () => {
        (LocalParserRunner.runLocalParser as Mock).mockResolvedValue(mockPythonIr);

        await expect(
            runLibraryDocsGeneration({
                libraries: {
                    "my-sdk": {
                        input: {
                            git: "https://github.com/acme/sdk",
                            ref: "release/2.0",
                            subpath: "packages/sdk"
                        },
                        output: { path: "./docs" },
                        lang: "python"
                    }
                },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext()
            })
        ).resolves.toEqual({ successful: 1 });

        expect(GitHub.cloneRepositoryAtRef).toHaveBeenCalledWith({
            repositoryUrl: "https://github.com/acme/sdk",
            ref: "release/2.0"
        });
        expect(GitHub.resolveRepositorySubpath).toHaveBeenCalledWith(
            expect.objectContaining({ repositoryRoot: "/tmp/clones/repo", subpath: "packages/sdk" })
        );
        const call = (LocalParserRunner.runLocalParser as Mock).mock.calls[0]?.[0] as Record<string, unknown>;
        expect(String(call.sourcePath)).toBe("/tmp/clones/repo");
        expect(call.config).toEqual(
            expect.objectContaining({
                packagePath: "packages/sdk",
                sourceUrl: "https://github.com/acme/sdk",
                branch: "release/2.0"
            })
        );
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("maps lang: cpp → CPP and calls generateCpp", async () => {
        (LocalParserRunner.runLocalParser as Mock).mockResolvedValue(mockCppIr);

        await expect(
            runLibraryDocsGeneration({
                libraries: { "cpp-lib": { ...pathConfig(), lang: "cpp" } },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext()
            })
        ).resolves.toEqual({ successful: 1 });

        const call = (LocalParserRunner.runLocalParser as Mock).mock.calls[0]?.[0] as Record<string, unknown>;
        expect(call.language).toBe("CPP");
        expect(CppDocsGenerator.generateCpp).toHaveBeenCalledWith(
            expect.objectContaining({ ir: mockCppIr, slug: "cpp-lib" })
        );
    });

    it("respects the library filter — only the named library is generated", async () => {
        (LocalParserRunner.runLocalParser as Mock).mockResolvedValue(mockPythonIr);

        await expect(
            runLibraryDocsGeneration({
                libraries: {
                    "sdk-a": pathConfig(),
                    "sdk-b": {
                        input: { path: "./other-src" } as unknown as docsYml.RawSchemas.LibraryInputConfiguration,
                        output: { path: "./docs-b" },
                        lang: "python"
                    }
                },
                library: "sdk-a",
                docsDirectoryPath: DOCS_DIR,
                context: makeContext()
            })
        ).resolves.toEqual({ successful: 1 });

        expect(LocalParserRunner.runLocalParser).toHaveBeenCalledTimes(1);
        const call = (LocalParserRunner.runLocalParser as Mock).mock.calls[0]?.[0] as Record<string, unknown>;
        expect(String(call.sourcePath)).toBe("/tmp/docs/local-src");
    });

    it("rejects when the parser produces an IR without the expected root node", async () => {
        (LocalParserRunner.runLocalParser as Mock).mockResolvedValue({});

        await expect(
            runLibraryDocsGeneration({
                libraries: { "my-sdk": pathConfig() },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext()
            })
        ).rejects.toThrow(/rootModule/);
    });

    it("invokes wrapStep around each long-running step", async () => {
        (LocalParserRunner.runLocalParser as Mock).mockResolvedValue(mockPythonIr);

        const messages: string[] = [];
        const wrapStep: StepWrapper = async ({ message, operation }) => {
            messages.push(message);
            return operation();
        };

        await runLibraryDocsGeneration({
            libraries: { "my-sdk": pathConfig() },
            docsDirectoryPath: DOCS_DIR,
            context: makeContext(),
            wrapStep
        });

        expect(messages.some((m) => m.includes("parsing library source locally"))).toBe(true);
    });

    describe("remote escape hatch (--remote)", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("rejects when --remote is set without a token or org", async () => {
            await expect(
                runLibraryDocsGeneration({
                    libraries: { "my-sdk": gitConfig() },
                    docsDirectoryPath: DOCS_DIR,
                    context: makeContext(),
                    remote: true
                })
            ).rejects.toThrow(/Authentication is required/);
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it("rejects 'path' input with --remote", async () => {
            await expect(
                runLibraryDocsGeneration({
                    libraries: { "path-lib": pathConfig() },
                    docsDirectoryPath: DOCS_DIR,
                    context: makeContext(),
                    remote: true,
                    orgId: "org",
                    tokenValue: "tok"
                })
            ).rejects.toThrow(/'path' input is not supported with --remote/);
        });

        it("happy path: start → poll → download IR → generate (Python), never touching the local parser", async () => {
            const { mockFn, startCalls } = makeMockFetch({
                startResponse: { body: { jobId: "job-1" } },
                statusResponses: [{ body: makeStatus("PENDING") }, { body: makeStatus("COMPLETED") }]
            });
            globalThis.fetch = mockFn as unknown as typeof fetch;

            const promise = runLibraryDocsGeneration({
                libraries: { "my-sdk": gitConfig() },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext(),
                remote: true,
                orgId: "org",
                tokenValue: "tok-123"
            });

            await vi.advanceTimersByTimeAsync(3000);
            await vi.advanceTimersByTimeAsync(3000);
            await expect(promise).resolves.toEqual({ successful: 1 });

            expect(startCalls.length).toBe(1);
            const startCall = startCalls[0] as Record<string, unknown>;
            expect(startCall.language).toBe("PYTHON");
            expect(startCall.githubUrl).toBe("https://github.com/acme/sdk");
            expect(startCall.orgId).toBe("org");
            expect(PythonDocsGenerator.generate).toHaveBeenCalledWith(
                expect.objectContaining({ ir: mockPythonIr, slug: "my-sdk", title: "my-sdk" })
            );
            expect(LocalParserRunner.runLocalParser).not.toHaveBeenCalled();
            expect(GitHub.cloneRepositoryAtRef).not.toHaveBeenCalled();
        });

        it("forwards git ref and subpath to the generation service", async () => {
            const { mockFn, startCalls } = makeMockFetch({
                startResponse: { body: { jobId: "job-ref" } },
                statusResponses: [{ body: makeStatus("COMPLETED") }]
            });
            globalThis.fetch = mockFn as unknown as typeof fetch;

            const promise = runLibraryDocsGeneration({
                libraries: {
                    "my-sdk": {
                        input: {
                            git: "https://github.com/acme/sdk",
                            ref: "release/2.0",
                            subpath: "packages/sdk"
                        },
                        output: { path: "./docs" },
                        lang: "python"
                    }
                },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext(),
                remote: true,
                orgId: "org",
                tokenValue: "tok"
            });
            await vi.advanceTimersByTimeAsync(3000);
            await promise;

            expect((startCalls[0] as { config: unknown }).config).toEqual(
                expect.objectContaining({
                    branch: "release/2.0",
                    packagePath: "packages/sdk"
                })
            );
        });

        it("sends the bearer token in the auth header", async () => {
            const { mockFn } = makeMockFetch({
                startResponse: { body: { jobId: "job-auth" } },
                statusResponses: [{ body: makeStatus("COMPLETED") }]
            });
            globalThis.fetch = mockFn as unknown as typeof fetch;

            const promise = runLibraryDocsGeneration({
                libraries: { "my-sdk": gitConfig() },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext(),
                remote: true,
                orgId: "org",
                tokenValue: "tok-abc"
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
                libraries: { "my-sdk": gitConfig() },
                docsDirectoryPath: DOCS_DIR,
                context: makeContext(),
                remote: true,
                orgId: "org",
                tokenValue: "tok"
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
                    libraries: { "my-sdk": gitConfig() },
                    docsDirectoryPath: DOCS_DIR,
                    context: makeContext(),
                    remote: true,
                    orgId: "org",
                    tokenValue: "tok"
                })
            ).rejects.toThrow(/Failed to start generation/);
        });
    });
});
