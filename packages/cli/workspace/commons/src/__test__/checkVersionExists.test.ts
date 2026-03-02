import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    checkVersionDoesNotAlreadyExist,
    doesCratesVersionExist,
    doesGithubTagExist,
    doesGoVersionExist,
    doesMavenVersionExist,
    doesNpmVersionExist,
    doesNugetVersionExist,
    doesPypiVersionExist,
    doesRubyGemsVersionExist,
    doesVersionExistOnRegistry,
    getGithubRepository,
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
    const failMessages: string[] = [];
    return {
        logger: {
            debug: (msg: string) => {
                debugMessages.push(msg);
            }
        },
        failAndThrow: (msg: string): never => {
            failMessages.push(msg);
            throw new Error(msg);
        },
        _debugMessages: debugMessages,
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
});

// ─── doesGithubTagExist ─────────────────────────────────────────────

describe("doesGithubTagExist", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        delete process.env.GITHUB_TOKEN;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns true when v-prefixed tag exists", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200)); // v1.0.0 found
        expect(await doesGithubTagExist("owner/repo", "1.0.0")).toBe(true);
        // Should try v1.0.0 first
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/git/ref/tags/v1.0.0"), expect.any(Object));
    });

    it("returns true when non-v tag exists (fallback)", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404)) // v1.0.0 not found
            .mockResolvedValueOnce(mockFetchResponse({}, true, 200)); // 1.0.0 found
        expect(await doesGithubTagExist("owner/repo", "1.0.0")).toBe(true);
    });

    it("returns false when no tag variant exists", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404))
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        expect(await doesGithubTagExist("owner/repo", "1.0.0")).toBe(false);
    });

    it("sends auth header when GITHUB_TOKEN is set", async () => {
        process.env.GITHUB_TOKEN = "gh-token";
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200));
        await doesGithubTagExist("owner/repo", "1.0.0");
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    authorization: "Bearer gh-token"
                })
            })
        );
    });

    it("handles version with v prefix (tries v1.0.0 and 1.0.0)", async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404))
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404));
        await doesGithubTagExist("owner/repo", "v1.0.0");
        // First call should try "v1.0.0", second should try "1.0.0"
        expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain("tags/v1.0.0");
        expect(vi.mocked(fetch).mock.calls[1]?.[0]).toContain("tags/1.0.0");
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
});

// ─── getGithubRepository ────────────────────────────────────────────

describe("getGithubRepository", () => {
    it("extracts owner/repo from githubV2 output mode", () => {
        const invocation = makeGithubV2Invocation("myorg", "my-sdk");
        expect(getGithubRepository(invocation)).toBe("myorg/my-sdk");
    });

    it("returns undefined for non-GitHub output modes", () => {
        const invocation = makePublishInvocation("typescript");
        expect(getGithubRepository(invocation)).toBeUndefined();
    });

    it("returns undefined for download output mode", () => {
        const invocation = makeDownloadInvocation("typescript");
        expect(getGithubRepository(invocation)).toBeUndefined();
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
        delete process.env.GITHUB_TOKEN;
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

    it("calls failAndThrow when registry version exists", async () => {
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

    it("checks GitHub tags for githubV2 output mode", async () => {
        // GitHub tag check: v1.0.0 found
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, true, 200));
        const ctx = makeMockContext();
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: undefined,
                generatorInvocation: makeGithubV2Invocation("owner", "repo"),
                context: ctx
            })
        ).rejects.toThrow("already exists as a tag");
        expect(ctx._failMessages[0]).toContain("GitHub");
    });

    it("silently continues when GitHub tag check fails with network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);
        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: undefined,
            generatorInvocation: makeGithubV2Invocation("owner", "repo"),
            context: ctx
        });
        expect(ctx._failMessages).toHaveLength(0);
        expect(ctx._debugMessages).toHaveLength(1);
    });

    it("falls through to registry check when GitHub tag check errors", async () => {
        // GitHub tag check: throws network error
        vi.mocked(fetch)
            .mockImplementationOnce(mockFetchError) // GitHub tag check fails
            .mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" })); // npm registry returns version exists

        const ctx = makeMockContext();
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: "@acme/sdk",
                generatorInvocation: makeGithubV2Invocation("owner", "repo", "typescript"),
                context: ctx
            })
        ).rejects.toThrow("already exists on the npm");
        // Should have debug message from GitHub error AND fail from registry check
        expect(ctx._debugMessages).toHaveLength(1);
        expect(ctx._debugMessages[0]).toContain("GitHub");
    });

    it("checks both GitHub tags AND registry for githubV2 with language", async () => {
        // GitHub tag check: neither v1.0.0 nor 1.0.0 exist
        vi.mocked(fetch)
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404)) // v1.0.0
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404)) // 1.0.0
            .mockResolvedValueOnce(mockFetchResponse({ version: "1.0.0" })); // npm version found

        const ctx = makeMockContext();
        await expect(
            checkVersionDoesNotAlreadyExist({
                version: "1.0.0",
                packageName: "@acme/sdk",
                generatorInvocation: makeGithubV2Invocation("owner", "repo", "typescript"),
                context: ctx
            })
        ).rejects.toThrow("already exists on the npm");
    });

    it("skips registry check when language is null", async () => {
        // GitHub tag check: no tags found
        vi.mocked(fetch)
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404))
            .mockResolvedValueOnce(mockFetchResponse({}, false, 404));

        const ctx = makeMockContext();
        await checkVersionDoesNotAlreadyExist({
            version: "1.0.0",
            packageName: "pkg",
            generatorInvocation: makeGithubV2Invocation("owner", "repo"),
            context: ctx
        });
        // Only 2 fetch calls (GitHub tag checks), no registry check
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(ctx._failMessages).toHaveLength(0);
    });
});
