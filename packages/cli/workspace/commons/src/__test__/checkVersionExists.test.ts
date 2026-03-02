import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    checkVersionDoesNotAlreadyExist,
    doesCratesVersionExist,
    doesGoVersionExist,
    doesMavenVersionExist,
    doesNpmVersionExist,
    doesNugetVersionExist,
    doesPypiVersionExist,
    doesRubyGemsVersionExist,
    doesVersionExistOnRegistry,
    getPackageNameFromGeneratorConfig,
    getRegistryName
} from "../checkVersionExists.js";

// ─── Helpers ────────────────────────────────────────────────────────

function mockFetchResponse(body: unknown, ok = true, status = 200): Response {
    return {
        ok,
        status,
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body))
    } as unknown as Response;
}

function mockFetchError(): never {
    throw new TypeError("fetch failed");
}

function mockFetchTimeout(): never {
    throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
}

function mockFetchJsonError(ok = true, status = 200): Response {
    return {
        ok,
        status,
        json: () => {
            throw new SyntaxError("Unexpected token < in JSON at position 0");
        },
        text: () => Promise.resolve("<html>Server Error</html>")
    } as unknown as Response;
}

/** Minimal GeneratorInvocation stub for publish output mode */
function makePublishInvocation(language: string) {
    return {
        language,
        outputMode: { type: "publishV2" as const }
        // biome-ignore lint/suspicious/noExplicitAny: test stub for GeneratorInvocation
    } as any;
}

/** Minimal GeneratorInvocation stub for download output mode */
function makeDownloadInvocation(language: string) {
    return {
        language,
        outputMode: { type: "downloadFiles" as const }
        // biome-ignore lint/suspicious/noExplicitAny: test stub for GeneratorInvocation
    } as any;
}

/** Minimal GeneratorInvocation stub for GitHub V2 output mode */
function makeGithubV2Invocation(owner: string, repo: string, language?: string) {
    return {
        language: language ?? null,
        outputMode: {
            type: "githubV2" as const,
            githubV2: { owner, repo }
        }
        // biome-ignore lint/suspicious/noExplicitAny: test stub for GeneratorInvocation
    } as any;
}

/** Mock TaskContext that tracks calls */
function makeMockContext() {
    const debugMessages: string[] = [];
    const warnMessages: string[] = [];
    const failMessages: string[] = [];
    return {
        logger: {
            debug: (msg: string) => {
                debugMessages.push(msg);
            },
            warn: (msg: string) => {
                warnMessages.push(msg);
            }
        },
        failAndThrow: (msg: string): never => {
            failMessages.push(msg);
            throw new Error(msg);
        },
        _debugMessages: debugMessages,
        _warnMessages: warnMessages,
        _failMessages: failMessages
        // biome-ignore lint/suspicious/noExplicitAny: test stub for TaskContext
    } as any;
}

// ─── Unit tests: individual registry checkers (mocked fetch) ────────

describe("doesNpmVersionExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        delete process.env.NPM_TOKEN;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when version exists", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.2.3" }));
        expect(await doesNpmVersionExist("my-pkg", "1.2.3")).toBe(true);
    });

    it("returns false when version does not match", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.2.4" }));
        expect(await doesNpmVersionExist("my-pkg", "1.2.3")).toBe(false);
    });

    it("returns false on 404", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        expect(await doesNpmVersionExist("my-pkg", "1.2.3")).toBe(false);
    });

    it("sends auth header when NPM_TOKEN is set", async () => {
        process.env.NPM_TOKEN = "test-token";
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        await doesNpmVersionExist("@scope/pkg", "1.0.0");

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("registry.npmjs.org"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    authorization: "Bearer test-token"
                })
            })
        );
    });

    it("passes AbortSignal for timeout", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        await doesNpmVersionExist("pkg", "1.0.0");

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                signal: expect.any(AbortSignal)
            })
        );
    });

    it("throws on network error (not caught internally)", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);
        await expect(doesNpmVersionExist("pkg", "1.0.0")).rejects.toThrow("fetch failed");
    });

    it("throws on timeout (not caught internally)", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchTimeout);
        await expect(doesNpmVersionExist("pkg", "1.0.0")).rejects.toThrow("timeout");
    });

    it("returns false on 500 server error", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        expect(await doesNpmVersionExist("pkg", "1.0.0")).toBe(false);
    });

    it("returns false on 401 unauthorized", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 401));
        expect(await doesNpmVersionExist("pkg", "1.0.0")).toBe(false);
    });

    it("returns false on 403 forbidden", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 403));
        expect(await doesNpmVersionExist("pkg", "1.0.0")).toBe(false);
    });

    it("returns false when response has empty body", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200));
        expect(await doesNpmVersionExist("pkg", "1.0.0")).toBe(false);
    });

    it("returns false when response has unexpected shape", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ name: "pkg", dist: {} }, true, 200));
        expect(await doesNpmVersionExist("pkg", "1.0.0")).toBe(false);
    });

    it("throws when json() throws (non-JSON response)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchJsonError(true, 200));
        await expect(doesNpmVersionExist("pkg", "1.0.0")).rejects.toThrow("Unexpected token");
    });

    it("encodes scoped package names correctly", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        await doesNpmVersionExist("@scope/pkg", "1.0.0");
        const calledUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string;
        expect(calledUrl).toBe("https://registry.npmjs.org/@scope%2Fpkg/1.0.0");
    });

    it("does not send auth header when NPM_TOKEN is not set", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        await doesNpmVersionExist("pkg", "1.0.0");
        const calledOptions = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
        const headers = calledOptions.headers as Record<string, string>;
        expect(headers.authorization).toBeUndefined();
    });
});

describe("doesPypiVersionExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when version exists (200)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200));
        expect(await doesPypiVersionExist("requests", "2.31.0")).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
            "https://pypi.org/pypi/requests/2.31.0/json",
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });

    it("returns false on 404", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        expect(await doesPypiVersionExist("nonexistent", "1.0.0")).toBe(false);
    });

    it("returns false on 500 server error", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        expect(await doesPypiVersionExist("pkg", "1.0.0")).toBe(false);
    });

    it("throws on timeout (not caught internally)", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchTimeout);
        await expect(doesPypiVersionExist("pkg", "1.0.0")).rejects.toThrow("timeout");
    });
});

describe("doesMavenVersionExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when numFound > 0", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({ response: { numFound: 1, docs: [{ v: "1.0.0" }] } })
        );
        expect(await doesMavenVersionExist("com.example:lib", "1.0.0")).toBe(true);
    });

    it("returns false when numFound = 0", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ response: { numFound: 0, docs: [] } }));
        expect(await doesMavenVersionExist("com.example:lib", "9.9.9")).toBe(false);
    });

    it("returns false for invalid coordinate (no colon)", async () => {
        expect(await doesMavenVersionExist("invalid-no-colon", "1.0.0")).toBe(false);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("returns false on 500 server error", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        expect(await doesMavenVersionExist("com.example:lib", "1.0.0")).toBe(false);
    });

    it("returns false when response has no numFound", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ response: {} }));
        expect(await doesMavenVersionExist("com.example:lib", "1.0.0")).toBe(false);
    });

    it("returns false when response field is missing entirely", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}));
        expect(await doesMavenVersionExist("com.example:lib", "1.0.0")).toBe(false);
    });

    it("returns false for coordinate with empty parts", async () => {
        expect(await doesMavenVersionExist(":lib", "1.0.0")).toBe(false);
        expect(await doesMavenVersionExist("com.example:", "1.0.0")).toBe(false);
    });
});

describe("doesNugetVersionExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when version is in the list (case-insensitive)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ versions: ["1.0.0", "2.0.0", "3.0.0"] }));
        expect(await doesNugetVersionExist("MyPkg", "2.0.0")).toBe(true);
    });

    it("returns false when version is not in the list", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ versions: ["1.0.0"] }));
        expect(await doesNugetVersionExist("MyPkg", "9.9.9")).toBe(false);
    });

    it("lowercases the package name in the URL", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ versions: [] }));
        await doesNugetVersionExist("Newtonsoft.Json", "1.0.0");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("newtonsoft.json"), expect.any(Object));
    });

    it("returns false on 500 server error", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        expect(await doesNugetVersionExist("MyPkg", "1.0.0")).toBe(false);
    });

    it("returns false when versions field is missing", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}));
        expect(await doesNugetVersionExist("MyPkg", "1.0.0")).toBe(false);
    });
});

describe("doesRubyGemsVersionExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when version exists", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200));
        expect(await doesRubyGemsVersionExist("rails", "7.0.0")).toBe(true);
    });

    it("returns false on 404", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        expect(await doesRubyGemsVersionExist("rails", "999.0.0")).toBe(false);
    });

    it("returns false on 500 server error", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        expect(await doesRubyGemsVersionExist("rails", "1.0.0")).toBe(false);
    });
});

describe("doesGoVersionExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when version info is returned", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ Version: "v1.0.0" }));
        expect(await doesGoVersionExist("golang.org/x/text", "1.0.0")).toBe(true);
    });

    it("adds v prefix automatically", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ Version: "v1.0.0" }));
        await doesGoVersionExist("golang.org/x/text", "1.0.0");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("v1.0.0.info"), expect.any(Object));
    });

    it("case-encodes uppercase letters in module path", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        await doesGoVersionExist("github.com/Azure/sdk", "1.0.0");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("!azure"), expect.any(Object));
    });

    it("returns false on 404", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        expect(await doesGoVersionExist("nonexistent.com/mod", "1.0.0")).toBe(false);
    });

    it("returns false on 500 server error", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        expect(await doesGoVersionExist("golang.org/x/text", "1.0.0")).toBe(false);
    });

    it("returns false when Version field is missing", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}));
        expect(await doesGoVersionExist("golang.org/x/text", "1.0.0")).toBe(false);
    });

    it("does not add extra v prefix when version already starts with v", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ Version: "v1.0.0" }));
        await doesGoVersionExist("golang.org/x/text", "v1.0.0");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("v1.0.0.info"), expect.any(Object));
        // Should NOT have vv1.0.0
        expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining("vv1.0.0"), expect.any(Object));
    });
});

describe("doesCratesVersionExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when version.num matches", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: { num: "1.0.0" } }));
        expect(await doesCratesVersionExist("serde", "1.0.0")).toBe(true);
    });

    it("returns false when version.num doesn't match", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: { num: "2.0.0" } }));
        expect(await doesCratesVersionExist("serde", "1.0.0")).toBe(false);
    });

    it("sends User-Agent header", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: { num: "1.0.0" } }));
        await doesCratesVersionExist("serde", "1.0.0");
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "user-agent": expect.stringContaining("fern-cli")
                })
            })
        );
    });

    it("returns false on 500 server error", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        expect(await doesCratesVersionExist("serde", "1.0.0")).toBe(false);
    });

    it("returns false when version.num is missing", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: {} }));
        expect(await doesCratesVersionExist("serde", "1.0.0")).toBe(false);
    });

    it("returns false when version field is missing entirely", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}));
        expect(await doesCratesVersionExist("serde", "1.0.0")).toBe(false);
    });
});

// ─── doesVersionExistOnRegistry (routing) ───────────────────────────

describe("doesVersionExistOnRegistry", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("routes typescript to npm", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        const result = await doesVersionExistOnRegistry({
            packageName: "pkg",
            version: "1.0.0",
            language: "typescript"
        });
        expect(result).toBe(true);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("registry.npmjs.org"), expect.any(Object));
    });

    it("routes python to pypi", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200));
        await doesVersionExistOnRegistry({ packageName: "pkg", version: "1.0.0", language: "python" });
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("pypi.org"), expect.any(Object));
    });

    it("returns false for unknown language", async () => {
        const result = await doesVersionExistOnRegistry({
            packageName: "pkg",
            version: "1.0.0",
            language: "haskell"
        });
        expect(result).toBe(false);
        expect(fetch).not.toHaveBeenCalled();
    });

    it.each([
        ["java", "Maven Central"],
        ["csharp", "NuGet"],
        ["ruby", "RubyGems"],
        ["go", "Go Module Proxy"],
        ["rust", "crates.io"]
    ])("routes %s to %s", async (language) => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        await doesVersionExistOnRegistry({
            packageName: language === "java" ? "com.example:lib" : language === "go" ? "golang.org/x/text" : "pkg",
            version: "1.0.0",
            language
        });
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});

// ─── getRegistryName ────────────────────────────────────────────────

describe("getRegistryName", () => {
    it.each([
        ["typescript", "npm"],
        ["python", "PyPI"],
        ["java", "Maven Central"],
        ["csharp", "NuGet"],
        ["ruby", "RubyGems"],
        ["go", "Go Module Proxy"],
        ["rust", "crates.io"]
    ])("returns %s for %s", (language, expected) => {
        expect(getRegistryName(language)).toBe(expected);
    });

    it("returns language string for unknown language", () => {
        expect(getRegistryName("haskell")).toBe("haskell");
    });
});

// ─── checkVersionDoesNotAlreadyExist (orchestrator) ─────────────────

describe("checkVersionDoesNotAlreadyExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        delete process.env.NPM_TOKEN;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("skips check when version is undefined (auto-computed)", async () => {
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: undefined,
            packageName: "pkg",
            generatorInvocation: makePublishInvocation("typescript"),
            context: ctx
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(ctx._failMessages).toHaveLength(0);
    });

    it("skips check when packageName is undefined and raw config has no package name", async () => {
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: undefined,
            generatorInvocation: makePublishInvocation("typescript"),
            context: ctx
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(ctx._failMessages).toHaveLength(0);
    });

    it("falls back to raw config package name when packageName is undefined", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        const ctx = makeMockContext();
        const invocation = {
            language: "typescript",
            outputMode: { type: "publishV2" as const },
            raw: { output: { "package-name": "@acme/sdk" } }
            // biome-ignore lint/suspicious/noExplicitAny: test stub for GeneratorInvocation
        } as any;
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: undefined,
                generatorInvocation: invocation,
                context: ctx
            })
        ).rejects.toThrow("already exists");
        expect(ctx._failMessages).toHaveLength(1);
        expect(ctx._failMessages[0]).toContain("@acme/sdk");
    });

    it("falls back to raw config Maven coordinate when packageName is undefined", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({ response: { numFound: 1, docs: [{ v: "1.0.0" }] } })
        );
        const ctx = makeMockContext();
        const invocation = {
            language: "java",
            outputMode: { type: "publishV2" as const },
            raw: { output: { coordinate: "com.example:lib" } }
            // biome-ignore lint/suspicious/noExplicitAny: test stub for GeneratorInvocation
        } as any;
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: undefined,
                generatorInvocation: invocation,
                context: ctx
            })
        ).rejects.toThrow("already exists");
        expect(ctx._failMessages).toHaveLength(1);
        expect(ctx._failMessages[0]).toContain("com.example:lib");
    });

    it("skips check for downloadFiles output mode", async () => {
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "pkg",
            generatorInvocation: makeDownloadInvocation("typescript"),
            context: ctx
        });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("calls failAndThrow when registry version exists (publishV2)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        const ctx = makeMockContext();
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: "@acme/sdk",
                generatorInvocation: makePublishInvocation("typescript"),
                context: ctx
            })
        ).rejects.toThrow("already exists");

        expect(ctx._failMessages).toHaveLength(1);
        expect(ctx._failMessages[0]).toContain("npm");
        expect(ctx._failMessages[0]).toContain("1.0.0");
    });

    it("does NOT call failAndThrow when registry version does not exist", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makePublishInvocation("typescript"),
            context: ctx
        });
        expect(ctx._failMessages).toHaveLength(0);
    });

    it("silently continues on network error (best-effort)", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makePublishInvocation("typescript"),
            context: ctx
        });
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._debugMessages).toHaveLength(1);
        expect(ctx._debugMessages[0]).toContain("Could not verify");
    });

    it("calls failAndThrow for legacy publish output mode", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        const ctx = makeMockContext();
        const invocation = {
            language: "typescript",
            outputMode: { type: "publish" as const }
            // biome-ignore lint/suspicious/noExplicitAny: test stub for GeneratorInvocation
        } as any;
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: "@acme/sdk",
                generatorInvocation: invocation,
                context: ctx
            })
        ).rejects.toThrow("already exists");
        expect(ctx._failMessages).toHaveLength(1);
    });

    it("logs warning (not error) for githubV2 output mode when version exists", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" }));
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makeGithubV2Invocation("owner", "repo", "typescript"),
            context: ctx
        });
        // Should warn, not fail
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._warnMessages).toHaveLength(1);
        expect(ctx._warnMessages[0]).toContain("already exists");
        expect(ctx._warnMessages[0]).toContain("CI pipeline");
    });

    it("does not warn for githubV2 when version does not exist", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makeGithubV2Invocation("owner", "repo", "typescript"),
            context: ctx
        });
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._warnMessages).toHaveLength(0);
    });

    it("skips check for githubV2 when language is null", async () => {
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "pkg",
            generatorInvocation: makeGithubV2Invocation("owner", "repo"),
            context: ctx
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._warnMessages).toHaveLength(0);
    });

    it("silently continues for githubV2 on network error (best-effort)", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makeGithubV2Invocation("owner", "repo", "typescript"),
            context: ctx
        });
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._warnMessages).toHaveLength(0);
        expect(ctx._debugMessages).toHaveLength(1);
        expect(ctx._debugMessages[0]).toContain("Could not verify");
    });

    it("silently continues on timeout error (best-effort)", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchTimeout);
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makePublishInvocation("typescript"),
            context: ctx
        });
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._debugMessages).toHaveLength(1);
        expect(ctx._debugMessages[0]).toContain("Could not verify");
        expect(ctx._debugMessages[0]).toContain("timeout");
    });

    it("silently continues when registry returns non-JSON (best-effort)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchJsonError(true, 200));
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makePublishInvocation("typescript"),
            context: ctx
        });
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._debugMessages).toHaveLength(1);
        expect(ctx._debugMessages[0]).toContain("Could not verify");
    });

    it("does not fail when registry returns 500 (version not found = proceeds)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 500));
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "@acme/sdk",
            generatorInvocation: makePublishInvocation("typescript"),
            context: ctx
        });
        // 500 → doesNpmVersionExist returns false → no failure, generation proceeds
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._warnMessages).toHaveLength(0);
    });

    it("gracefully handles all supported languages on network error", async () => {
        const languages = ["typescript", "python", "java", "csharp", "ruby", "go", "rust"];
        for (const lang of languages) {
            vi.mocked(fetch).mockImplementationOnce(mockFetchError);
            const ctx = makeMockContext();
            await checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: lang === "java" ? "com.example:lib" : "pkg",
                generatorInvocation: makePublishInvocation(lang),
                context: ctx
            });
            expect(ctx._failMessages).toHaveLength(0);
            expect(ctx._debugMessages).toHaveLength(1);
            expect(ctx._debugMessages[0]).toContain("Could not verify");
        }
    });

    it("gracefully handles unknown language (no registry check, no error)", async () => {
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "pkg",
            generatorInvocation: makePublishInvocation("swift"),
            context: ctx
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._warnMessages).toHaveLength(0);
    });

    it("error message includes registry name and version info", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ version: "2.5.0" }));
        const ctx = makeMockContext();
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "2.5.0",
                packageName: "@fern-api/sdk",
                generatorInvocation: makePublishInvocation("typescript"),
                context: ctx
            })
        ).rejects.toThrow();
        expect(ctx._failMessages[0]).toContain("2.5.0");
        expect(ctx._failMessages[0]).toContain("@fern-api/sdk");
        expect(ctx._failMessages[0]).toContain("npm");
        expect(ctx._failMessages[0]).toContain("omit the --version flag");
    });

    it("warning message includes registry name for githubV2", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200));
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "requests",
            generatorInvocation: makeGithubV2Invocation("owner", "repo", "python"),
            context: ctx
        });
        expect(ctx._warnMessages).toHaveLength(1);
        expect(ctx._warnMessages[0]).toContain("PyPI");
        expect(ctx._warnMessages[0]).toContain("CI pipeline");
    });
});

// ─── getPackageNameFromGeneratorConfig ───────────────────────────────

describe("getPackageNameFromGeneratorConfig", () => {
    it("returns package-name from output", () => {
        const invocation = {
            raw: { output: { "package-name": "@acme/sdk" } }
            // biome-ignore lint/suspicious/noExplicitAny: test stub
        } as any;
        expect(getPackageNameFromGeneratorConfig(invocation)).toBe("@acme/sdk");
    });

    it("returns coordinate from output (Maven)", () => {
        const invocation = {
            raw: { output: { coordinate: "com.example:lib" } }
            // biome-ignore lint/suspicious/noExplicitAny: test stub
        } as any;
        expect(getPackageNameFromGeneratorConfig(invocation)).toBe("com.example:lib");
    });

    it("returns package_name from config as fallback", () => {
        const invocation = {
            raw: { config: { package_name: "my_package" } }
            // biome-ignore lint/suspicious/noExplicitAny: test stub
        } as any;
        expect(getPackageNameFromGeneratorConfig(invocation)).toBe("my_package");
    });

    it("returns module.path from config for Go", () => {
        const invocation = {
            raw: { config: { module: { path: "github.com/acme/go-sdk" } } }
            // biome-ignore lint/suspicious/noExplicitAny: test stub
        } as any;
        expect(getPackageNameFromGeneratorConfig(invocation)).toBe("github.com/acme/go-sdk");
    });

    it("prefers output.package-name over config.package_name", () => {
        const invocation = {
            raw: {
                output: { "package-name": "@acme/sdk" },
                config: { package_name: "fallback" }
            }
            // biome-ignore lint/suspicious/noExplicitAny: test stub
        } as any;
        expect(getPackageNameFromGeneratorConfig(invocation)).toBe("@acme/sdk");
    });

    it("returns undefined when raw is undefined", () => {
        const invocation = {
            raw: undefined
            // biome-ignore lint/suspicious/noExplicitAny: test stub
        } as any;
        expect(getPackageNameFromGeneratorConfig(invocation)).toBeUndefined();
    });

    it("returns undefined when no package name fields are set", () => {
        const invocation = {
            raw: { output: { location: "npm" }, config: { other: "value" } }
            // biome-ignore lint/suspicious/noExplicitAny: test stub
        } as any;
        expect(getPackageNameFromGeneratorConfig(invocation)).toBeUndefined();
    });
});
