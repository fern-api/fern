import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeConfigProcessor } from "../commands/docs-theme/ThemeConfigProcessor.js";

vi.mock("fs/promises", () => ({
    access: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(Buffer.from("fake-content"))
}));

// A config with every file-bearing field populated.
// When you add a new file field to ThemeConfigProcessor, add it here too —
// the sync test below will catch the omission.
const FULL_CONFIG: Record<string, unknown> = {
    logo: { dark: "logo-dark.png", light: "logo-light.png" },
    favicon: "favicon.ico",
    "background-image": { dark: "bg-dark.jpg", light: "bg-light.jpg" },
    typography: {
        bodyFont: { paths: [{ path: "body.woff2", weight: "400" }] },
        headingsFont: { paths: [{ path: "heading.woff2", weight: "700" }] },
        codeFont: { paths: [{ path: "code.woff2", weight: "400" }] }
    },
    css: ["style.css", "extra.css"],
    js: [
        "script.js",
        { path: "module.js" },
        { url: "https://cdn.example.com/lib.js" } // remote URL — must NOT be collected
    ],
    header: "header.html",
    footer: "footer.html",
    metadata: {
        "og:image": "og.jpg",
        "twitter:image": "twitter.jpg",
        "og:dynamic:background-image": "og-bg.jpg",
        "og:logo": "og-logo.jpg"
    }
};

// Expected local file paths that collectFilePaths should find in FULL_CONFIG.
const EXPECTED_PATHS = [
    "logo-dark.png",
    "logo-light.png",
    "favicon.ico",
    "bg-dark.jpg",
    "bg-light.jpg",
    "body.woff2",
    "heading.woff2",
    "code.woff2",
    "style.css",
    "extra.css",
    "script.js",
    "module.js",
    "header.html",
    "footer.html",
    "og.jpg",
    "twitter.jpg",
    "og-bg.jpg",
    "og-logo.jpg"
];

const MOCK_DOCS_WORKSPACE: DocsWorkspace = {
    type: "docs",
    workspaceName: undefined,
    absoluteFilePath: AbsoluteFilePath.of("/fake"),
    absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/fake/docs.yml"),
    config: { instances: [] }
};

function makeProcessor(): ThemeConfigProcessor {
    return new ThemeConfigProcessor({
        docsWorkspace: MOCK_DOCS_WORKSPACE,
        orgId: "test-org",
        token: "test-token",
        context: createMockTaskContext()
    });
}

describe("ThemeConfigProcessor.collectFilePaths", () => {
    it("collects exactly the expected local file paths from a fully-populated config", () => {
        const processor = makeProcessor();
        const paths = processor.collectFilePaths(FULL_CONFIG);
        expect(paths.sort()).toEqual([...EXPECTED_PATHS].sort());
    });

    it("skips remote URLs", () => {
        const processor = makeProcessor();
        const paths = processor.collectFilePaths({
            favicon: "https://example.com/favicon.ico",
            header: "http://example.com/header.html"
        });
        expect(paths).toHaveLength(0);
    });

    it("returns empty array for empty config", () => {
        const processor = makeProcessor();
        expect(processor.collectFilePaths({})).toEqual([]);
    });

    it("handles array and object JS entries", () => {
        const processor = makeProcessor();
        const paths = processor.collectFilePaths({
            js: ["local.js", { path: "module.js" }, { url: "https://cdn.example.com/remote.js" }]
        });
        expect(paths.sort()).toEqual(["local.js", "module.js"]);
    });

    it("handles CSS as a single string instead of array", () => {
        const processor = makeProcessor();
        const paths = processor.collectFilePaths({ css: "single.css" });
        expect(paths).toEqual(["single.css"]);
    });
});

describe("ThemeConfigProcessor field sync", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ status: "already_exists" }),
                text: async () => ""
            })
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("uploadAllFiles processes exactly the same files that collectFilePaths identifies", async () => {
        const processor = makeProcessor();

        const expectedPaths = processor.collectFilePaths(FULL_CONFIG);

        const { filesUploaded } = await processor.process(FULL_CONFIG);

        // If these diverge, a file field was added to one traversal but not the other.
        expect(filesUploaded).toBe(expectedPaths.length);
    });
});

describe("ThemeConfigProcessor CAS URL contract", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: "already_exists" }),
            text: async () => ""
        });
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function casUrls(): string[] {
        return fetchMock.mock.calls
            .map(([url]) => url)
            .filter((url): url is string => typeof url === "string" && url.includes("/v2/registry/content/"));
    }

    // Regression: the content-existence check must pass orgId as a path segment, not a query
    // param. FDR ignores `?orgId=` and falls back to the wrong org, so the content lands under
    // a different org than the subsequent file bind and the bind 422s.
    it("puts orgId in the content path (not as a query param) so it matches the file bind", async () => {
        await makeProcessor().process({ favicon: "favicon.ico" });

        const urls = casUrls();
        expect(urls).toHaveLength(1);
        const casUrl = urls[0]!;
        expect(casUrl).toMatch(/\/v2\/registry\/content\/test-org\/[0-9a-f]{64}$/);
        expect(casUrl).not.toContain("orgId=");
    });

    it("binds the asset under the same org used for the content check", async () => {
        await makeProcessor().process({ favicon: "favicon.ico" });

        const bindUrls = fetchMock.mock.calls
            .map(([url]) => url)
            .filter((url): url is string => typeof url === "string" && url.includes("/v2/registry/files/"));
        expect(bindUrls).toHaveLength(1);
        expect(bindUrls[0]!).toContain("/v2/registry/files/test-org/");
    });

    it("URL-encodes an orgId containing special characters", async () => {
        const processor = new ThemeConfigProcessor({
            docsWorkspace: MOCK_DOCS_WORKSPACE,
            orgId: "org/with space",
            token: "test-token",
            context: createMockTaskContext()
        });
        await processor.process({ favicon: "favicon.ico" });

        expect(casUrls()[0]!).toContain("/v2/registry/content/org%2Fwith%20space/");
    });
});

describe("themeOrigin FDR_ORIGIN resolution", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    async function loadOrigin(): Promise<string> {
        vi.resetModules();
        const mod = await import("../commands/docs-theme/themeOrigin.js");
        return mod.FDR_ORIGIN;
    }

    it("prefers OVERRIDE_FDR_ORIGIN when set", async () => {
        vi.stubEnv("OVERRIDE_FDR_ORIGIN", "https://override.example.com");
        vi.stubEnv("DEFAULT_FDR_ORIGIN", "https://registry-dev2.buildwithfern.com");
        expect(await loadOrigin()).toBe("https://override.example.com");
    });

    // Regression: without this fallback the theme command always hit the prod default, so a dev
    // CLI build sent a dev token to prod FDR and got a 403 "Failed to resolve organizations".
    it("falls back to the build-configured DEFAULT_FDR_ORIGIN when OVERRIDE is unset", async () => {
        vi.stubEnv("OVERRIDE_FDR_ORIGIN", undefined);
        vi.stubEnv("DEFAULT_FDR_ORIGIN", "https://registry-dev2.buildwithfern.com");
        expect(await loadOrigin()).toBe("https://registry-dev2.buildwithfern.com");
    });

    it("defaults to the production registry when neither is set", async () => {
        vi.stubEnv("OVERRIDE_FDR_ORIGIN", undefined);
        vi.stubEnv("DEFAULT_FDR_ORIGIN", undefined);
        expect(await loadOrigin()).toBe("https://registry.buildwithfern.com");
    });
});
