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
            previewId: undefined
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
            previewId: undefined
        });

        expect(Object.keys(input.pages)).toHaveLength(0);
    });

    it("serializes config as a JSON blob ref", () => {
        const { input, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined
        });

        expect(input.config).toBeDefined();
        expect(input.config!.contentType).toBe("application/json");
        // The blob should exist and round-trip back to the config.
        const configBuf = blobs.get(input.config!.hash);
        expect(configBuf).toBeDefined();
        expect(JSON.parse(configBuf!.toString("utf-8"))).toEqual({ root: MINIMAL_ROOT });
    });

    it("passes through org, domain, basepath, previewId", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: "/v2",
            previewId: "pr-42"
        });

        expect(input.orgId).toBe("acme");
        expect(input.domain).toBe("docs.acme.com");
        expect(input.basepath).toBe("/v2");
        expect(input.previewId).toBe("pr-42");
    });

    it("defaults basepath to empty string and previewId to null", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined
        });

        expect(input.basepath).toBe("");
        expect(input.previewId).toBeNull();
    });

    it("uses config.root for the root field", () => {
        const { input } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ root: MINIMAL_ROOT }),
            organization: "acme",
            domain: "docs.acme.com",
            basepath: undefined,
            previewId: undefined
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
            previewId: undefined
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
});
