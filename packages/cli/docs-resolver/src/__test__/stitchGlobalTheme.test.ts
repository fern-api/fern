import { isPlainObject } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    deepMergeGlobalWins,
    filenameFromUrl,
    isPresignedUrl,
    isRemoteUrl,
    mergeThemeOverride,
    parseFilenameFromDisposition,
    resolveThemeFileUrls,
    stitchGlobalTheme
} from "../stitchGlobalTheme.js";

// ---------------------------------------------------------------------------
// isPresignedUrl
// ---------------------------------------------------------------------------

describe("isPresignedUrl", () => {
    it("returns true for https URL with X-Amz- param", () => {
        expect(isPresignedUrl("https://s3.amazonaws.com/bucket/key?X-Amz-Signature=abc")).toBe(true);
    });

    it("returns true for http URL with X-Amz- param", () => {
        expect(isPresignedUrl("http://s3.amazonaws.com/bucket/key?X-Amz-Expires=900")).toBe(true);
    });

    it("returns false for https URL without X-Amz- param", () => {
        expect(isPresignedUrl("https://example.com/logo.svg")).toBe(false);
    });

    it("returns false for relative path", () => {
        expect(isPresignedUrl("assets/logo.svg")).toBe(false);
    });

    it("returns false for empty string", () => {
        expect(isPresignedUrl("")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isRemoteUrl
// ---------------------------------------------------------------------------

describe("isRemoteUrl", () => {
    it("returns true for https URL", () => {
        expect(isRemoteUrl("https://example.com")).toBe(true);
    });

    it("returns true for http URL", () => {
        expect(isRemoteUrl("http://example.com")).toBe(true);
    });

    it("returns false for relative path", () => {
        expect(isRemoteUrl("assets/logo.svg")).toBe(false);
    });

    it("returns false for empty string", () => {
        expect(isRemoteUrl("")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// parseFilenameFromDisposition
// ---------------------------------------------------------------------------

describe("parseFilenameFromDisposition", () => {
    it("returns undefined for null", () => {
        expect(parseFilenameFromDisposition(null)).toBeUndefined();
    });

    it("parses quoted filename with extension", () => {
        expect(parseFilenameFromDisposition('attachment; filename="NVIDIA_symbol.svg"')).toBe("NVIDIA_symbol.svg");
    });

    it("parses unquoted filename with extension", () => {
        expect(parseFilenameFromDisposition("attachment; filename=logo.png")).toBe("logo.png");
    });

    it("returns undefined for bare hash (no extension)", () => {
        expect(parseFilenameFromDisposition('attachment; filename="abc123def456"')).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
        expect(parseFilenameFromDisposition("")).toBeUndefined();
    });

    it("parses filename* form", () => {
        expect(parseFilenameFromDisposition("attachment; filename*=logo.svg")).toBe("logo.svg");
    });
});

// ---------------------------------------------------------------------------
// filenameFromUrl
// ---------------------------------------------------------------------------

describe("filenameFromUrl", () => {
    it("extracts filename from response-content-disposition query param", () => {
        const encoded = encodeURIComponent('attachment; filename="logo.svg"');
        const url = `https://s3.amazonaws.com/bucket/hash?response-content-disposition=${encoded}`;
        expect(filenameFromUrl(url)).toBe("logo.svg");
    });

    it("returns undefined when param is absent", () => {
        expect(filenameFromUrl("https://s3.amazonaws.com/bucket/abc123")).toBeUndefined();
    });

    it("returns undefined for an invalid URL", () => {
        expect(filenameFromUrl("not-a-url")).toBeUndefined();
    });

    it("returns undefined when disposition has no extension", () => {
        const encoded = encodeURIComponent('attachment; filename="abc123"');
        const url = `https://s3.amazonaws.com/bucket/hash?response-content-disposition=${encoded}`;
        expect(filenameFromUrl(url)).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// isPlainObject
// ---------------------------------------------------------------------------

describe("isPlainObject", () => {
    it("returns true for plain objects", () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject({ a: 1 })).toBe(true);
    });

    it("returns false for null", () => {
        expect(isPlainObject(null)).toBe(false);
    });

    it("returns false for primitives", () => {
        expect(isPlainObject("string")).toBe(false);
        expect(isPlainObject(42)).toBe(false);
        expect(isPlainObject(undefined)).toBe(false);
    });

    it("returns false for arrays", () => {
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject([1, 2, 3])).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// deepMergeGlobalWins
// ---------------------------------------------------------------------------

describe("deepMergeGlobalWins", () => {
    it("keeps local-only fields when global doesn't define them", () => {
        expect(deepMergeGlobalWins({ a: 1, b: 2 }, { a: 99 })).toEqual({ a: 99, b: 2 });
    });

    it("global wins on conflicting scalar fields", () => {
        expect(deepMergeGlobalWins({ a: "local" }, { a: "global" })).toEqual({ a: "global" });
    });

    it("adds global-only fields", () => {
        expect(deepMergeGlobalWins({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });

    it("recurses into nested objects — the logo bug scenario", () => {
        const local = { logo: { "right-text": "Docs", height: 28 } };
        const global = { logo: { dark: "dark.svg", light: "light.svg" } };
        expect(deepMergeGlobalWins(local, global)).toEqual({
            logo: { "right-text": "Docs", height: 28, dark: "dark.svg", light: "light.svg" }
        });
    });

    it("global wins on conflicting nested scalar", () => {
        const local = { logo: { href: "local.com", height: 28 } };
        const global = { logo: { href: "global.com" } };
        expect(deepMergeGlobalWins(local, global)).toEqual({ logo: { href: "global.com", height: 28 } });
    });

    it("global array replaces local array entirely (no element merge)", () => {
        expect(deepMergeGlobalWins({ items: [1, 2] }, { items: [3, 4, 5] })).toEqual({ items: [3, 4, 5] });
    });

    it("does not mutate inputs", () => {
        const local = { a: 1 };
        const global = { b: 2 };
        deepMergeGlobalWins(local, global);
        expect(local).toEqual({ a: 1 });
        expect(global).toEqual({ b: 2 });
    });
});

// ---------------------------------------------------------------------------
// mergeThemeOverride
// ---------------------------------------------------------------------------

describe("mergeThemeOverride", () => {
    it("deep-merges object fields — logo example from the bug report", () => {
        const local = { logo: { "right-text": "Docs", height: 28 } } as never;
        const globalTheme = {
            logo: { href: "https://example.com", dark: "logo-dark.svg", light: "logo-light.svg" }
        };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.logo).toEqual({
            href: "https://example.com",
            dark: "logo-dark.svg",
            light: "logo-light.svg",
            "right-text": "Docs",
            height: 28
        });
    });

    it("global scalar replaces local scalar (favicon)", () => {
        const local = { favicon: "local-favicon.ico" } as never;
        const result = mergeThemeOverride(local, { favicon: "global-favicon.ico" }) as unknown as Record<
            string,
            unknown
        >;
        expect(result.favicon).toBe("global-favicon.ico");
    });

    it("keeps local value when global doesn't define the field", () => {
        const local = { favicon: "local-favicon.ico" } as never;
        const result = mergeThemeOverride(local, {}) as unknown as Record<string, unknown>;
        expect(result.favicon).toBe("local-favicon.ico");
    });

    it("uses global value when local doesn't define the field", () => {
        const local = {} as never;
        const result = mergeThemeOverride(local, { favicon: "global-favicon.ico" }) as unknown as Record<
            string,
            unknown
        >;
        expect(result.favicon).toBe("global-favicon.ico");
    });

    it("normalizes kebab-case theme keys to camelCase before merging", () => {
        const local = {} as never;
        const result = mergeThemeOverride(local, { "background-image": "bg.png" }) as unknown as Record<
            string,
            unknown
        >;
        expect(result.backgroundImage).toBe("bg.png");
        expect(result["background-image"]).toBeUndefined();
    });

    it("background-image as string replaces local object", () => {
        const local = { backgroundImage: { dark: "dark-bg.png" } } as never;
        const result = mergeThemeOverride(local, { "background-image": "flat-bg.png" }) as unknown as Record<
            string,
            unknown
        >;
        expect(result.backgroundImage).toBe("flat-bg.png");
    });

    it("deep-merges typography — global bodyFont + local headingsFont both survive", () => {
        const local = { typography: { headingsFont: { name: "Local Heading Font" } } } as never;
        const globalTheme = { typography: { bodyFont: { name: "Global Body Font" } } };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.typography).toEqual({
            headingsFont: { name: "Local Heading Font" },
            bodyFont: { name: "Global Body Font" }
        });
    });

    it("global colors sub-fields win; local-only sub-fields survive", () => {
        const local = { colors: { accentPrimary: "#aaa", background: "#fff" } } as never;
        const globalTheme = { colors: { accentPrimary: "#000" } };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.colors).toEqual({ accentPrimary: "#000", background: "#fff" });
    });

    it("non-theme-eligible fields in local config are preserved unchanged", () => {
        const local = { title: "My Docs", tabs: [{ tab: "API" }] } as never;
        const result = mergeThemeOverride(local, { favicon: "f.ico" }) as unknown as Record<string, unknown>;
        expect(result.title).toBe("My Docs");
        expect(result.tabs).toEqual([{ tab: "API" }]);
    });
});

// ---------------------------------------------------------------------------
// resolveThemeFileUrls — non-presigned paths pass through unchanged
// ---------------------------------------------------------------------------

describe("resolveThemeFileUrls (non-presigned)", () => {
    it("preserves regular https logo URLs without downloading", async () => {
        const config = {
            logo: { dark: "https://example.com/logo-dark.svg", light: "https://example.com/logo-light.svg" }
        };
        const result = await resolveThemeFileUrls(config, "/tmp/test");
        expect((result.logo as Record<string, unknown>).dark).toBe("https://example.com/logo-dark.svg");
        expect((result.logo as Record<string, unknown>).light).toBe("https://example.com/logo-light.svg");
    });

    it("preserves regular https favicon without downloading", async () => {
        const config = { favicon: "https://example.com/favicon.ico" };
        const result = await resolveThemeFileUrls(config, "/tmp/test");
        expect(result.favicon).toBe("https://example.com/favicon.ico");
    });

    it("preserves remote JS entries with url field", async () => {
        const config = { js: [{ url: "https://cdn.example.com/script.js" }] };
        const result = await resolveThemeFileUrls(config, "/tmp/test");
        expect(result.js).toEqual([{ url: "https://cdn.example.com/script.js" }]);
    });

    it("preserves regular https CSS string without downloading", async () => {
        const config = { css: "https://example.com/styles.css" };
        const result = await resolveThemeFileUrls(config, "/tmp/test");
        expect(result.css).toBe("https://example.com/styles.css");
    });

    it("preserves css array with non-presigned URLs", async () => {
        const config = { css: ["https://example.com/a.css", "https://example.com/b.css"] };
        const result = await resolveThemeFileUrls(config, "/tmp/test");
        expect(result.css).toEqual(["https://example.com/a.css", "https://example.com/b.css"]);
    });

    it("does not mutate the input config", async () => {
        const config = { favicon: "https://example.com/favicon.ico" };
        await resolveThemeFileUrls(config, "/tmp/test");
        expect(config).toEqual({ favicon: "https://example.com/favicon.ico" });
    });
});

// ---------------------------------------------------------------------------
// stitchGlobalTheme
// ---------------------------------------------------------------------------

function makeDocsWorkspace(config: Record<string, unknown> = {}) {
    return {
        type: "docs" as const,
        workspaceName: undefined,
        absoluteFilePath: AbsoluteFilePath.of("/workspace/fern"),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/workspace/fern/docs.yml"),
        config: config as never
    };
}

function makeFetchResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: () => Promise.resolve(JSON.stringify(body)),
        headers: { get: () => null }
    } as unknown as Response;
}

describe("stitchGlobalTheme", () => {
    const taskContext = createMockTaskContext();

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns workspace unchanged when no globalTheme is declared", async () => {
        const workspace = makeDocsWorkspace({});
        const result = await stitchGlobalTheme({
            docsWorkspace: workspace,
            organization: "acme",
            fdrOrigin: "https://fdr.example.com",
            token: "tok",
            taskContext
        });
        expect(result).toBe(workspace);
        expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    });

    it("throws when FDR returns 404", async () => {
        vi.mocked(fetch).mockResolvedValue(makeFetchResponse({}, 404));
        const workspace = makeDocsWorkspace({ globalTheme: "my-theme" });
        await expect(
            stitchGlobalTheme({
                docsWorkspace: workspace,
                organization: "acme",
                fdrOrigin: "https://fdr.example.com",
                token: "tok",
                taskContext
            })
        ).rejects.toThrow();
    });

    it("throws when FDR returns non-2xx status", async () => {
        vi.mocked(fetch).mockResolvedValue(makeFetchResponse({}, 500));
        const workspace = makeDocsWorkspace({ globalTheme: "my-theme" });
        await expect(
            stitchGlobalTheme({
                docsWorkspace: workspace,
                organization: "acme",
                fdrOrigin: "https://fdr.example.com",
                token: "tok",
                taskContext
            })
        ).rejects.toThrow();
    });

    it("throws when FDR body encodes NOT_FOUND error in a 200", async () => {
        vi.mocked(fetch).mockResolvedValue(
            makeFetchResponse({ error: { code: "NOT_FOUND", message: "theme not found" } })
        );
        const workspace = makeDocsWorkspace({ globalTheme: "my-theme" });
        await expect(
            stitchGlobalTheme({
                docsWorkspace: workspace,
                organization: "acme",
                fdrOrigin: "https://fdr.example.com",
                token: "tok",
                taskContext
            })
        ).rejects.toThrow();
    });

    it("throws when FDR body is missing config field", async () => {
        vi.mocked(fetch).mockResolvedValue(makeFetchResponse({}));
        const workspace = makeDocsWorkspace({ globalTheme: "my-theme" });
        await expect(
            stitchGlobalTheme({
                docsWorkspace: workspace,
                organization: "acme",
                fdrOrigin: "https://fdr.example.com",
                token: "tok",
                taskContext
            })
        ).rejects.toThrow();
    });

    it("merges global theme config over local config on success", async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            makeFetchResponse({
                config: {
                    favicon: "https://example.com/favicon.ico",
                    logo: { dark: "https://example.com/dark.svg", light: "https://example.com/light.svg" }
                }
            })
        );

        const workspace = makeDocsWorkspace({
            globalTheme: "my-theme",
            favicon: "local-favicon.ico",
            logo: { "right-text": "Docs", height: 28 }
        });

        const result = await stitchGlobalTheme({
            docsWorkspace: workspace,
            organization: "acme",
            fdrOrigin: "https://fdr.example.com",
            token: "tok",
            taskContext
        });

        const config = result.config as unknown as Record<string, unknown>;
        expect(config.favicon).toBe("https://example.com/favicon.ico");
        expect(config.logo).toEqual({
            dark: "https://example.com/dark.svg",
            light: "https://example.com/light.svg",
            "right-text": "Docs",
            height: 28
        });
    });

    it("builds the correct FDR URL from org and theme name (percent-encodes special chars)", async () => {
        vi.mocked(fetch).mockResolvedValue(makeFetchResponse({ config: { favicon: "https://example.com/fav.ico" } }));
        const workspace = makeDocsWorkspace({ globalTheme: "my theme/special" });

        await stitchGlobalTheme({
            docsWorkspace: workspace,
            organization: "my org",
            fdrOrigin: "https://fdr.example.com",
            token: "tok",
            taskContext
        });

        const calledUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string;
        expect(calledUrl).toBe("https://fdr.example.com/v2/registry/themes/my%20org/my%20theme%2Fspecial");
    });

    it("sends Authorization and Accept-Encoding: identity headers", async () => {
        vi.mocked(fetch).mockResolvedValue(makeFetchResponse({ config: { favicon: "https://example.com/fav.ico" } }));
        const workspace = makeDocsWorkspace({ globalTheme: "my-theme" });

        await stitchGlobalTheme({
            docsWorkspace: workspace,
            organization: "acme",
            fdrOrigin: "https://fdr.example.com",
            token: "secret-token",
            taskContext
        });

        const calledHeaders = (vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit | undefined)?.headers as Record<
            string,
            string
        >;
        expect(calledHeaders?.["Authorization"]).toBe("Bearer secret-token");
        expect(calledHeaders?.["Accept-Encoding"]).toBe("identity");
    });
});
