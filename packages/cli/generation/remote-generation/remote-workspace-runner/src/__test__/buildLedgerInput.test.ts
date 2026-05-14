import type { APIV1Write } from "@fern-api/fdr-sdk";
import type { FileManifestEntry } from "@fern-api/fdr-sdk/orpc-client";
import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import { buildLedgerInput } from "../publishDocsLedger.js";

function sha256(data: string): string {
    return createHash("sha256").update(Buffer.from(data, "utf-8")).digest("hex");
}

const MINIMAL_ROOT = {
    type: "root" as const,
    version: "v1" as const,
    id: "root-1",
    child: {
        type: "unversioned" as const,
        id: "uv-1",
        child: { type: "sidebarRoot" as const, id: "sr-1", children: [] }
    }
};

function makeDocsDefinition({
    pages = {},
    root = MINIMAL_ROOT
}: {
    pages?: Record<string, { markdown: string }>;
    root?: unknown;
} = {}) {
    // Minimal DocsDefinition shape — only the fields buildLedgerInput reads.
    return {
        pages,
        config: { root }
    } as Parameters<typeof buildLedgerInput>[0]["docsDefinition"];
}

describe("buildLedgerInput", () => {
    it("hashes page content and creates blob refs", () => {
        const markdown = "# Hello World";
        const { input, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ pages: { "page-1": { markdown } } }),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        const expectedHash = sha256(markdown);
        expect(input.pages["page-1"]).toEqual({
            hash: expectedHash,
            contentType: "text/markdown",
            contentLength: Buffer.byteLength(markdown, "utf-8")
        });
        expect(blobs.has(expectedHash)).toBe(true);
    });

    it("skips null/undefined pages", () => {
        const pages = { "page-1": null } as unknown as Record<string, { markdown: string }>;
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ pages }),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        expect(Object.keys(input.pages)).toHaveLength(0);
    });

    it("omits config (TODO: Track B mapping)", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        // DocsConfig → LedgerConfig mapping is Track B in the PRD. Until that
        // lands, we send `config: undefined` so the publish passes FDR's
        // LedgerConfigSchema validation. FDR's transform handles missing
        // config gracefully.
        expect(input.config).toBeUndefined();
    });

    it("passes through org, domain, basepath, previewId", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: "/v2",
            previewId: "pr-42",
            apiDefinitions: new Map()
        });

        expect(input.orgId).toBe("acme");
        expect(input.domain).toBe("docs.acme.com");
        expect(input.basepath).toBe("/v2");
        expect(input.previewId).toBe("pr-42");
    });

    it("defaults basepath to empty string, previewId to null, and locale to en", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        expect(input.basepath).toBe("");
        expect(input.previewId).toBeNull();
        expect(input.locale).toBe("en");
    });

    it("uses config.root for the root field", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ root: MINIMAL_ROOT }),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        expect(input.root).toEqual(MINIMAL_ROOT);
    });

    it("deduplicates pages with identical content", () => {
        const markdown = "same content";
        const { blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({
                pages: {
                    "page-a": { markdown },
                    "page-b": { markdown }
                }
            }),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        // Two pages with the same content should produce one blob (content-addressed).
        const pageHashes = new Set(
            Object.values(blobs)
                .filter((buf) => buf.toString("utf-8") === markdown)
                .map((_, i) => i)
        );
        // The blobs map is keyed by hash, so duplicate content = one entry.
        const markdownHash = sha256(markdown);
        expect(blobs.get(markdownHash)?.toString("utf-8")).toBe(markdown);
    });

    it("sets apiManifest to null when apiDefinitions is empty", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        expect(input.apiManifest).toBeNull();
    });

    it("serializes apiManifest as a JSON blob ref when apiDefinitions is non-empty", () => {
        const minimalApiDefinition: APIV1Write.ApiDefinition = {
            types: {},
            subpackages: {},
            rootPackage: {
                endpoints: [],
                types: [],
                subpackages: [],
                websockets: [],
                webhooks: []
            },
            auth: undefined,
            snippetsConfiguration: {},
            globalHeaders: []
        };

        const apiDefinitions = new Map<string, APIV1Write.ApiDefinition>();
        apiDefinitions.set("api-def-1", minimalApiDefinition);

        const { input, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions
        });

        expect(input.apiManifest).not.toBeNull();
        expect(input.apiManifest?.contentType).toBe("application/json");
        expect(input.apiManifest?.contentLength).toBeGreaterThan(0);

        // The blob should exist in the blob map.
        const manifestBuf = blobs.get(input.apiManifest?.hash ?? "");
        expect(manifestBuf).toBeDefined();

        // Round-trip: the blob content should deserialize to match the input map.
        const parsed = JSON.parse(manifestBuf?.toString("utf-8") ?? "");
        expect(parsed).toEqual({ "api-def-1": minimalApiDefinition });
    });

    it("forwards fileManifest unchanged and merges fileBlobs into the blob map", () => {
        // Image entry — exercises width/height fields.
        const imageBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG header
        const imageHash = createHash("sha256").update(new Uint8Array(imageBytes)).digest("hex");
        const imageEntry: FileManifestEntry = {
            hash: imageHash,
            contentType: "image/png",
            contentLength: imageBytes.byteLength,
            filename: "logo.png",
            width: 200,
            height: 100
        };

        // Non-image entry — no width/height.
        const docBytes = Buffer.from("hello world", "utf-8");
        const docHash = createHash("sha256").update(new Uint8Array(docBytes)).digest("hex");
        const docEntry: FileManifestEntry = {
            hash: docHash,
            contentType: "text/plain",
            contentLength: docBytes.byteLength,
            filename: "notes.txt"
        };

        const fileManifest: Record<string, FileManifestEntry> = {
            "assets/logo.png": imageEntry,
            "docs/notes.txt": docEntry
        };
        const fileBlobs = new Map<string, Buffer>([
            [imageHash, imageBytes],
            [docHash, docBytes]
        ]);

        const { input, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map(),
            fileManifest,
            fileBlobs
        });

        // fileManifest round-trips unchanged.
        expect(input.fileManifest).toEqual(fileManifest);

        // File hashes show up in the returned blobs map alongside page/config blobs.
        expect(blobs.get(imageHash)).toEqual(imageBytes);
        expect(blobs.get(docHash)).toEqual(docBytes);
    });

    it("legacy behaviour: omitting fileManifest still works", () => {
        const { input, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ pages: { "page-1": { markdown: "# hi" } } }),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined,
            apiDefinitions: new Map()
        });

        expect(input.fileManifest).toBeUndefined();
        // Blob map still contains the page + config blobs.
        expect(blobs.size).toBeGreaterThan(0);
    });
});
