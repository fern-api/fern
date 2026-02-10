import path from "path";
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
// Must import after vi.mock so mocks are in place
import { askToLogin } from "@fern-api/login";
import { type GenerateLibraryDocsOptions, generateLibraryDocs } from "../generateLibraryDocs.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Pure logic tests
// ---------------------------------------------------------------------------

describe("generateLibraryDocs", () => {
    describe("library selection logic", () => {
        it("should select all libraries when no --library flag is provided", () => {
            const libraries = {
                "python-sdk": {
                    input: { git: "https://github.com/acme/py" },
                    output: { path: "./py-docs" },
                    lang: "python" as const
                },
                "cpp-sdk": {
                    input: { git: "https://github.com/acme/cpp" },
                    output: { path: "./cpp-docs" },
                    lang: "cpp" as const
                }
            };
            const library: string | undefined = undefined;

            const librariesToGenerate =
                library != null ? { [library]: libraries[library as keyof typeof libraries] } : libraries;

            expect(Object.keys(librariesToGenerate)).toHaveLength(2);
            expect("python-sdk" in librariesToGenerate).toBe(true);
            expect("cpp-sdk" in librariesToGenerate).toBe(true);
        });

        it("should select only specified library when --library flag is provided", () => {
            const libraries = {
                "python-sdk": {
                    input: { git: "https://github.com/acme/py" },
                    output: { path: "./py-docs" },
                    lang: "python" as const
                },
                "cpp-sdk": {
                    input: { git: "https://github.com/acme/cpp" },
                    output: { path: "./cpp-docs" },
                    lang: "cpp" as const
                }
            };
            const library: string | undefined = "python-sdk";

            const librariesToGenerate =
                library != null ? { [library]: libraries[library as keyof typeof libraries] } : libraries;

            expect(Object.keys(librariesToGenerate)).toHaveLength(1);
            expect("python-sdk" in librariesToGenerate).toBe(true);
            expect("cpp-sdk" in librariesToGenerate).toBe(false);
        });

        it("should return undefined for non-existent library", () => {
            const libraries = {
                "python-sdk": {
                    input: { git: "https://github.com/acme/py" },
                    output: { path: "./py-docs" },
                    lang: "python" as const
                }
            };
            const library = "non-existent";

            const selectedLibrary = libraries[library as keyof typeof libraries];

            expect(selectedLibrary).toBeUndefined();
        });
    });

    describe("validation logic", () => {
        it("should detect when no libraries are configured", () => {
            const libraries: Record<string, unknown> | undefined = undefined;

            const hasLibraries = libraries != null && Object.keys(libraries).length > 0;

            expect(hasLibraries).toBe(false);
        });

        it("should detect when libraries object is empty", () => {
            const libraries: Record<string, unknown> = {};

            const hasLibraries = libraries != null && Object.keys(libraries).length > 0;

            expect(hasLibraries).toBe(false);
        });

        it("should detect when libraries are configured", () => {
            const libraries = {
                "my-sdk": { input: { git: "https://github.com/acme/sdk" }, output: { path: "./docs" }, lang: "python" }
            };

            const hasLibraries = libraries != null && Object.keys(libraries).length > 0;

            expect(hasLibraries).toBe(true);
        });

        it("should detect when requested library does not exist", () => {
            const libraries = {
                "my-sdk": { input: { git: "https://github.com/acme/sdk" }, output: { path: "./docs" }, lang: "python" }
            };
            const requestedLibrary = "other-sdk";

            const libraryExists = libraries[requestedLibrary as keyof typeof libraries] != null;

            expect(libraryExists).toBe(false);
        });

        it("should detect when requested library exists", () => {
            const libraries = {
                "my-sdk": { input: { git: "https://github.com/acme/sdk" }, output: { path: "./docs" }, lang: "python" }
            };
            const requestedLibrary = "my-sdk";

            const libraryExists = libraries[requestedLibrary as keyof typeof libraries] != null;

            expect(libraryExists).toBe(true);
        });
    });

    describe("language mapping", () => {
        function mapLanguage(lang: "python" | "cpp"): "PYTHON" | "CPP" {
            return lang === "python" ? "PYTHON" : "CPP";
        }

        it("maps 'python' to 'PYTHON'", () => {
            expect(mapLanguage("python")).toBe("PYTHON");
        });

        it("maps 'cpp' to 'CPP'", () => {
            expect(mapLanguage("cpp")).toBe("CPP");
        });
    });

    describe("output path resolution", () => {
        it("resolves relative path against fern folder", () => {
            const fernFolder = "/home/user/project/fern";
            const outputPath = "./static/sdk-docs";

            const resolved = path.resolve(fernFolder, outputPath);

            expect(resolved).toBe("/home/user/project/fern/static/sdk-docs");
        });

        it("resolves path without ./ prefix", () => {
            const fernFolder = "/home/user/project/fern";
            const outputPath = "static/sdk-docs";

            const resolved = path.resolve(fernFolder, outputPath);

            expect(resolved).toBe("/home/user/project/fern/static/sdk-docs");
        });

        it("resolves parent-relative path", () => {
            const fernFolder = "/home/user/project/fern";
            const outputPath = "../docs/sdk";

            const resolved = path.resolve(fernFolder, outputPath);

            expect(resolved).toBe("/home/user/project/docs/sdk");
        });
    });

    describe("available libraries formatting", () => {
        it("should format single library name correctly", () => {
            const libraries = { "my-sdk": {} };
            expect(Object.keys(libraries).join(", ")).toBe("my-sdk");
        });

        it("should format multiple library names correctly", () => {
            const libraries = { "python-sdk": {}, "cpp-sdk": {}, "java-sdk": {} };
            expect(Object.keys(libraries).join(", ")).toBe("python-sdk, cpp-sdk, java-sdk");
        });
    });
});

// ---------------------------------------------------------------------------
// Flow tests with mocked FDR client
// ---------------------------------------------------------------------------

describe("generateLibraryDocs — FDR flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Disable poll delay for tests
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /** Advance timers to resolve the poll setTimeout */
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

    it("happy path: start → poll (PENDING → COMPLETED) → fetch IR → generate", async () => {
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

        // Mock global fetch for IR download (Lambda wraps IR in { ir: ... })
        const mockIr = {
            rootModule: { name: "sdk", path: "sdk", submodules: [], classes: [], functions: [], attributes: [] }
        };
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ir: mockIr })
        }) as unknown as typeof fetch;

        (generate as Mock).mockReturnValue({
            navigation: [],
            rootPageId: "my-sdk/sdk.mdx",
            writtenFiles: [],
            pageCount: 1,
            navigationFilePath: "/tmp/docs/_navigation.yml"
        });

        // Run the function — don't await yet so we can advance timers
        const promise = generateLibraryDocs({
            project: project as unknown as GenerateLibraryDocsOptions["project"],
            cliContext: ctx as unknown as GenerateLibraryDocsOptions["cliContext"],
            library: undefined
        });

        // Advance through 3 poll cycles
        await advancePolling();
        await advancePolling();
        await advancePolling();

        await promise;

        // Verify FDR client was created with token
        expect(createFdrService).toHaveBeenCalledWith({ token: "tok-123" });

        // Verify start was called with correct params
        const startCall = mockFdr.docs.v2.write.startLibraryDocsGeneration.mock.calls[0]?.[0];
        expect(startCall.language).toBe("PYTHON");
        expect(startCall.githubUrl).toBe("https://github.com/acme/sdk");

        // Verify generate was called with the downloaded IR
        expect(generate).toHaveBeenCalledWith(
            expect.objectContaining({
                ir: mockIr,
                slug: "my-sdk",
                title: "my-sdk"
            })
        );

        // Verify success was logged
        expect(ctx.logs.some((l: string) => l.includes("Generated 1 pages"))).toBe(true);

        globalThis.fetch = originalFetch;
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

        // Attach the rejection handler before advancing timers to avoid unhandled rejection
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

        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                ir: {
                    rootModule: { name: "lib", path: "lib", submodules: [], classes: [], functions: [], attributes: [] }
                }
            })
        }) as unknown as typeof fetch;

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

        globalThis.fetch = originalFetch;
    });
});
