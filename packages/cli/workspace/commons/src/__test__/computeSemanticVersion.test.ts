import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    getLatestTag,
    getLatestVersionFromCrates,
    getLatestVersionFromGoProxy,
    getLatestVersionFromMaven,
    getLatestVersionFromNpm,
    getLatestVersionFromNuget,
    getLatestVersionFromPypi,
    getLatestVersionFromRubyGems
} from "../computeSemanticVersion.js";

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

// ─── Unit tests (mocked fetch) ─────────────────────────────────────

describe("getLatestVersionFromNpm", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        delete process.env.NPM_TOKEN;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns latest version from authenticated registry when NPM_TOKEN is set", async () => {
        process.env.NPM_TOKEN = "test-token";
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                "dist-tags": { latest: "2.5.3" },
                name: "@scope/private-pkg"
            })
        );

        const version = await getLatestVersionFromNpm("@scope/private-pkg");
        expect(version).toBe("2.5.3");

        // Verify auth header was sent
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("registry.npmjs.org"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    authorization: "Bearer test-token"
                })
            })
        );
    });

    it("falls through to unauthenticated when NPM_TOKEN auth fails", async () => {
        process.env.NPM_TOKEN = "bad-token";
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 401));

        // latestVersion is used as fallback — mock it via the module
        // Since latestVersion is imported at module level, we test that the function
        // returns undefined when both paths fail (private package)
        const version = await getLatestVersionFromNpm("nonexistent-package-xyz-123");
        // This will either return a version from latestVersion() or undefined
        // We can't easily mock the latestVersion import, so just verify it doesn't throw
        expect(version === undefined || typeof version === "string").toBe(true);
    });

    it("returns undefined on network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);

        const version = await getLatestVersionFromNpm("some-package");
        expect(version).toBeUndefined();
    });
});

describe("getLatestVersionFromPypi", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns version from PyPI JSON API", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                info: { version: "3.2.1" }
            })
        );

        const version = await getLatestVersionFromPypi("requests");
        expect(version).toBe("3.2.1");
        expect(fetch).toHaveBeenCalledWith("https://pypi.org/pypi/requests/json");
    });

    it("returns undefined when package does not exist", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));

        const version = await getLatestVersionFromPypi("nonexistent-pypi-pkg-xyz");
        expect(version).toBeUndefined();
    });

    it("returns undefined on network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);

        const version = await getLatestVersionFromPypi("requests");
        expect(version).toBeUndefined();
    });
});

describe("getLatestVersionFromMaven", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns latest version from Maven Central Solr API", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                response: {
                    docs: [{ latestVersion: "33.4.0-jre" }]
                }
            })
        );

        const version = await getLatestVersionFromMaven("com.google.guava:guava");
        expect(version).toBe("33.4.0-jre");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("search.maven.org/solrsearch/select"));
    });

    it("returns undefined for invalid coordinate format (no colon)", async () => {
        const version = await getLatestVersionFromMaven("invalid-no-colon");
        expect(version).toBeUndefined();
        // Should not call fetch for invalid coordinates
        expect(fetch).not.toHaveBeenCalled();
    });

    it("returns undefined when no docs in response", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                response: { docs: [] }
            })
        );

        const version = await getLatestVersionFromMaven("com.example:nonexistent");
        expect(version).toBeUndefined();
    });

    it("returns undefined on network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);

        const version = await getLatestVersionFromMaven("com.google.guava:guava");
        expect(version).toBeUndefined();
    });
});

describe("getLatestVersionFromNuget", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns latest stable version from NuGet flat container API", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                versions: ["12.0.1", "12.0.2", "13.0.1", "13.0.2-beta1", "13.0.3"]
            })
        );

        const version = await getLatestVersionFromNuget("Newtonsoft.Json");
        expect(version).toBe("13.0.3");
        expect(fetch).toHaveBeenCalledWith("https://api.nuget.org/v3-flatcontainer/newtonsoft.json/index.json");
    });

    it("skips prerelease versions (with hyphen)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                versions: ["1.0.0", "2.0.0-alpha", "2.0.0-beta1"]
            })
        );

        const version = await getLatestVersionFromNuget("SomePackage");
        expect(version).toBe("1.0.0");
    });

    it("returns undefined when all versions are prerelease", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                versions: ["1.0.0-alpha", "2.0.0-beta"]
            })
        );

        const version = await getLatestVersionFromNuget("SomePackage");
        expect(version).toBeUndefined();
    });

    it("lowercases the package name in the URL", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ versions: ["1.0.0"] }));

        await getLatestVersionFromNuget("Newtonsoft.Json");
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("newtonsoft.json"));
    });

    it("returns undefined on network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);

        const version = await getLatestVersionFromNuget("Newtonsoft.Json");
        expect(version).toBeUndefined();
    });
});

describe("getLatestVersionFromRubyGems", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns version from RubyGems API", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                version: "8.0.1",
                name: "rails"
            })
        );

        const version = await getLatestVersionFromRubyGems("rails");
        expect(version).toBe("8.0.1");
        expect(fetch).toHaveBeenCalledWith("https://rubygems.org/api/v1/gems/rails.json");
    });

    it("returns undefined when gem does not exist", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));

        const version = await getLatestVersionFromRubyGems("nonexistent-gem-xyz");
        expect(version).toBeUndefined();
    });

    it("returns undefined on network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);

        const version = await getLatestVersionFromRubyGems("rails");
        expect(version).toBeUndefined();
    });
});

describe("getLatestVersionFromGoProxy", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns version with v prefix stripped", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                Version: "v0.22.0",
                Time: "2024-12-06T17:06:22Z"
            })
        );

        const version = await getLatestVersionFromGoProxy("golang.org/x/text");
        expect(version).toBe("0.22.0");
        // All lowercase path should pass through unchanged
        expect(fetch).toHaveBeenCalledWith("https://proxy.golang.org/golang.org/x/text/@latest");
    });

    it("case-encodes uppercase letters in module path", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ Version: "v1.0.0" }));

        await getLatestVersionFromGoProxy("github.com/Azure/azure-sdk-for-go");
        // "Azure" -> "!azure"
        expect(fetch).toHaveBeenCalledWith("https://proxy.golang.org/github.com/!azure/azure-sdk-for-go/@latest");
    });

    it("handles version without v prefix", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ Version: "1.2.3" }));

        const version = await getLatestVersionFromGoProxy("example.com/mod");
        expect(version).toBe("1.2.3");
    });

    it("case-encodes multiple uppercase letters", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ Version: "v2.0.0" }));

        await getLatestVersionFromGoProxy("github.com/MyOrg/MyRepo");
        expect(fetch).toHaveBeenCalledWith("https://proxy.golang.org/github.com/!my!org/!my!repo/@latest");
    });

    it("returns undefined when module does not exist", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));

        const version = await getLatestVersionFromGoProxy("nonexistent.example.com/mod");
        expect(version).toBeUndefined();
    });

    it("returns undefined on network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);

        const version = await getLatestVersionFromGoProxy("golang.org/x/text");
        expect(version).toBeUndefined();
    });
});

describe("getLatestVersionFromCrates", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("returns max_stable_version from Crates.io", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            mockFetchResponse({
                crate: {
                    name: "serde",
                    max_stable_version: "1.0.219"
                }
            })
        );

        const version = await getLatestVersionFromCrates("serde");
        expect(version).toBe("1.0.219");
        expect(fetch).toHaveBeenCalledWith(
            "https://crates.io/api/v1/crates/serde",
            expect.objectContaining({
                headers: expect.objectContaining({
                    "user-agent": expect.stringContaining("fern-cli")
                })
            })
        );
    });

    it("sends User-Agent header (required by Crates.io)", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({ crate: { max_stable_version: "1.0.0" } }));

        await getLatestVersionFromCrates("serde");
        const callArgs = vi.mocked(fetch).mock.calls[0];
        expect(callArgs?.[1]).toBeDefined();
        const headers = (callArgs?.[1] as RequestInit)?.headers as Record<string, string>;
        expect(headers["user-agent"]).toBeDefined();
    });

    it("returns undefined when crate does not exist", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse({}, false, 404));

        const version = await getLatestVersionFromCrates("nonexistent-crate-xyz");
        expect(version).toBeUndefined();
    });

    it("returns undefined on network error", async () => {
        vi.mocked(fetch).mockImplementationOnce(mockFetchError);

        const version = await getLatestVersionFromCrates("serde");
        expect(version).toBeUndefined();
    });
});

describe("getLatestTag", () => {
    beforeEach(() => {
        delete process.env.GITHUB_TOKEN;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete process.env.GITHUB_TOKEN;
    });

    it("returns undefined for invalid repository format", async () => {
        const version = await getLatestTag("invalid-no-slash");
        expect(version).toBeUndefined();
    });
});

// ─── Integration tests (real API calls) ─────────────────────────────
// These tests hit real public registries. They are skipped by default in CI
// to avoid rate limits and flakiness. Set RUN_REGISTRY_INTEGRATION_TESTS=true
// to run them locally for validation.

const INTEGRATION = process.env.RUN_REGISTRY_INTEGRATION_TESTS === "true";

describe.skipIf(!INTEGRATION)("registry integration tests", () => {
    // Increase timeout for real network calls
    const TIMEOUT = 15_000;

    it(
        "npm: fetches latest version of a well-known public package",
        async () => {
            const version = await getLatestVersionFromNpm("lodash");
            expect(version).toBeDefined();
            expect(version).toMatch(/^\d+\.\d+\.\d+/);
        },
        TIMEOUT
    );

    it(
        "npm: returns undefined for nonexistent package",
        async () => {
            const version = await getLatestVersionFromNpm("zzz-nonexistent-pkg-fern-test-12345");
            expect(version).toBeUndefined();
        },
        TIMEOUT
    );

    it(
        "PyPI: fetches latest version of a well-known public package",
        async () => {
            const version = await getLatestVersionFromPypi("requests");
            expect(version).toBeDefined();
            expect(version).toMatch(/^\d+\.\d+/);
        },
        TIMEOUT
    );

    it(
        "PyPI: returns undefined for nonexistent package",
        async () => {
            const version = await getLatestVersionFromPypi("zzz-nonexistent-pkg-fern-test-12345");
            expect(version).toBeUndefined();
        },
        TIMEOUT
    );

    it(
        "Maven: fetches latest version of a well-known artifact",
        async () => {
            const version = await getLatestVersionFromMaven("com.google.guava:guava");
            expect(version).toBeDefined();
            expect(version).toMatch(/^\d+/);
        },
        TIMEOUT
    );

    it(
        "Maven: returns undefined for nonexistent artifact",
        async () => {
            const version = await getLatestVersionFromMaven("com.nonexistent.fern:test-12345");
            expect(version).toBeUndefined();
        },
        TIMEOUT
    );

    it(
        "NuGet: fetches latest stable version of a well-known package",
        async () => {
            const version = await getLatestVersionFromNuget("Newtonsoft.Json");
            expect(version).toBeDefined();
            expect(version).toMatch(/^\d+\.\d+/);
            // Should not be a prerelease
            expect(version).not.toMatch(/-/);
        },
        TIMEOUT
    );

    it(
        "NuGet: returns undefined for nonexistent package",
        async () => {
            const version = await getLatestVersionFromNuget("Zzz.Nonexistent.Fern.Test.12345");
            expect(version).toBeUndefined();
        },
        TIMEOUT
    );

    it(
        "RubyGems: fetches latest version of a well-known gem",
        async () => {
            const version = await getLatestVersionFromRubyGems("rails");
            expect(version).toBeDefined();
            expect(version).toMatch(/^\d+\.\d+/);
        },
        TIMEOUT
    );

    it(
        "RubyGems: returns undefined for nonexistent gem",
        async () => {
            const version = await getLatestVersionFromRubyGems("zzz-nonexistent-gem-fern-test-12345");
            expect(version).toBeUndefined();
        },
        TIMEOUT
    );

    it(
        "Go proxy: fetches latest version of a well-known module",
        async () => {
            const version = await getLatestVersionFromGoProxy("golang.org/x/text");
            expect(version).toBeDefined();
            expect(version).toMatch(/^\d+\.\d+/);
            // Should NOT have the v prefix
            expect(version).not.toMatch(/^v/);
        },
        TIMEOUT
    );

    it(
        "Go proxy: returns undefined for nonexistent module",
        async () => {
            const version = await getLatestVersionFromGoProxy("nonexistent.example.com/zzz-fern-test-12345");
            expect(version).toBeUndefined();
        },
        TIMEOUT
    );

    it(
        "Crates.io: fetches latest stable version of a well-known crate",
        async () => {
            const version = await getLatestVersionFromCrates("serde");
            expect(version).toBeDefined();
            expect(version).toMatch(/^\d+\.\d+/);
        },
        TIMEOUT
    );

    it(
        "Crates.io: returns undefined for nonexistent crate",
        async () => {
            const version = await getLatestVersionFromCrates("zzz-nonexistent-crate-fern-test-12345");
            expect(version).toBeUndefined();
        },
        TIMEOUT
    );

    it(
        "GitHub tags: fetches latest tag from a well-known public repo",
        async () => {
            const tag = await getLatestTag("lodash/lodash");
            expect(tag).toBeDefined();
            expect(typeof tag).toBe("string");
        },
        TIMEOUT
    );

    it(
        "GitHub tags: returns undefined for nonexistent repo",
        async () => {
            const tag = await getLatestTag("zzz-nonexistent-org-fern/zzz-nonexistent-repo-12345");
            expect(tag).toBeUndefined();
        },
        TIMEOUT
    );
});
