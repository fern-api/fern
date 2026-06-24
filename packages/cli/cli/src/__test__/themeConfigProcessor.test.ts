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

describe("ThemeConfigProcessor CAS upload URLs", () => {
    let fetchSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchSpy = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: "already_exists" }),
            text: async () => ""
        });
        vi.stubGlobal("fetch", fetchSpy);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("uses the org-scoped CAS path /v2/registry/content/{orgId}/{hash}, not a query param", async () => {
        const processor = makeProcessor();
        await processor.process({ favicon: "favicon.ico" });

        const casCall = fetchSpy.mock.calls.find(
            (call: unknown[]) => typeof call[0] === "string" && (call[0] as string).includes("/v2/registry/content/")
        );
        expect(casCall).toBeDefined();
        if (casCall == null) {
            throw new Error("expected casCall");
        }

        const casUrl = casCall[0] as string;
        expect(casUrl).toContain("/v2/registry/content/test-org/");
        expect(casUrl).not.toContain("?orgId=");
    });

    it("uses the same orgId in both CAS and bind URLs", async () => {
        const processor = makeProcessor();
        await processor.process({ favicon: "favicon.ico" });

        const urls = fetchSpy.mock.calls.map((call: unknown[]) => call[0] as string);
        const casUrl = urls.find((u: string) => u.includes("/v2/registry/content/"));
        const bindUrl = urls.find((u: string) => u.includes("/v2/registry/files/"));

        expect(casUrl).toBeDefined();
        expect(bindUrl).toBeDefined();
        expect(casUrl).toContain("/test-org/");
        expect(bindUrl).toContain("/test-org/");
    });

    it("encodes special characters in orgId for the CAS URL", async () => {
        const processor = new ThemeConfigProcessor({
            docsWorkspace: MOCK_DOCS_WORKSPACE,
            orgId: "org with spaces/slash",
            token: "test-token",
            context: createMockTaskContext()
        });
        await processor.process({ favicon: "favicon.ico" });

        const casCall = fetchSpy.mock.calls.find(
            (call: unknown[]) => typeof call[0] === "string" && (call[0] as string).includes("/v2/registry/content/")
        );
        expect(casCall).toBeDefined();
        if (casCall == null) {
            throw new Error("expected casCall");
        }
        const casUrl = casCall[0] as string;

        expect(casUrl).toContain("/v2/registry/content/org%20with%20spaces%2Fslash/");
        expect(casUrl).not.toContain("?orgId=");
    });

    it("uploads to S3 when CAS returns upload_required", async () => {
        const s3UploadUrl = "https://s3.example.com/presigned-upload";
        fetchSpy.mockImplementation(async (url: string) => {
            if (typeof url === "string" && url.includes("/v2/registry/content/")) {
                return {
                    ok: true,
                    json: async () => ({ status: "upload_required", uploadUrl: s3UploadUrl }),
                    text: async () => ""
                };
            }
            return { ok: true, json: async () => ({}), text: async () => "" };
        });

        const processor = makeProcessor();
        await processor.process({ favicon: "favicon.ico" });

        const s3Call = fetchSpy.mock.calls.find((call: unknown[]) => call[0] === s3UploadUrl);
        expect(s3Call).toBeDefined();
        if (s3Call == null) {
            throw new Error("expected s3Call");
        }
        expect((s3Call[1] as RequestInit).method).toBe("PUT");
    });

    it("skips S3 upload when CAS returns already_exists", async () => {
        const processor = makeProcessor();
        await processor.process({ favicon: "favicon.ico" });

        const urls = fetchSpy.mock.calls.map((call: unknown[]) => call[0] as string);
        const s3Calls = urls.filter((u: string) => u.startsWith("https://s3"));
        expect(s3Calls).toHaveLength(0);
    });

    it("sends correct hash and contentType in the bind request body", async () => {
        const processor = makeProcessor();
        await processor.process({ favicon: "favicon.ico" });

        const bindCall = fetchSpy.mock.calls.find(
            (call: unknown[]) => typeof call[0] === "string" && (call[0] as string).includes("/v2/registry/files/")
        );
        expect(bindCall).toBeDefined();
        if (bindCall == null) {
            throw new Error("expected bindCall");
        }

        const bindBody = JSON.parse((bindCall[1] as RequestInit).body as string);
        expect(bindBody.hash).toMatch(/^[0-9a-f]{64}$/);
        expect(bindBody.contentType).toBeDefined();
    });
});
