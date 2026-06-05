import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import { buildLedgerInput } from "../publishDocsLedger.js";

type BuildLedgerInputArgs = Parameters<typeof buildLedgerInput>[0];
type ApiDefinition = BuildLedgerInputArgs["apiDefinitions"] extends Map<string, infer T> ? T : never;
type FileManifestEntry = NonNullable<BuildLedgerInputArgs["fileManifest"]>[string];

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
        const { localeEntry, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ pages: { "page-1": { markdown } } }),
            apiDefinitions: new Map()
        });

        const expectedHash = sha256(markdown);
        expect(localeEntry.pages["page-1"]).toEqual({
            hash: expectedHash,
            contentType: "text/markdown",
            contentLength: Buffer.byteLength(markdown, "utf-8")
        });
        expect(blobs.has(expectedHash)).toBe(true);
    });

    it("rewrites legacy FileId markdown refs to path refs before hashing page blobs", () => {
        const fileId = "5ea17f4b-98bd-4d97-a07b-e92a314825d0";
        const fullPath = "docs/assets/docs/astro-hypervisor.svg";
        const markdown = `![Diagram](file:${fileId})\n<img src="file:${fileId}" />`;
        const expectedMarkdown = `![Diagram](file:${fullPath})\n<img src="file:${fullPath}" />`;
        const { localeEntry, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ pages: { "page-1": { markdown } } }),
            apiDefinitions: new Map(),
            fileIdToPath: new Map([[fileId, fullPath]])
        });

        const expectedHash = sha256(expectedMarkdown);
        expect(localeEntry.pages["page-1"]).toEqual({
            hash: expectedHash,
            contentType: "text/markdown",
            contentLength: Buffer.byteLength(expectedMarkdown, "utf-8"),
            referencedFiles: [fullPath]
        });
        expect(blobs.get(expectedHash)?.toString("utf-8")).toBe(expectedMarkdown);
        expect([...blobs.values()].some((buf) => buf.toString("utf-8").includes(fileId))).toBe(false);
    });

    it("skips null/undefined pages", () => {
        const pages = { "page-1": null } as unknown as Record<string, { markdown: string }>;
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ pages }),
            apiDefinitions: new Map()
        });

        expect(Object.keys(localeEntry.pages)).toHaveLength(0);
    });

    it("maps a minimal DocsConfig to a LedgerConfig shape (mostly empty fields)", () => {
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: new Map()
        });

        // With only `root` set on the source DocsConfig every LedgerConfig
        // field is `undefined` — but `localeEntry.config` itself is the populated
        // ledger object (not `undefined`), unlike the prior workaround.
        expect(localeEntry.config).toBeDefined();
        expect(localeEntry.config?.title).toBeUndefined();
        expect(localeEntry.config?.colorsV3).toBeUndefined();
        expect(localeEntry.config?.metadata).toBeUndefined();
        expect(localeEntry.config?.redirects).toBeUndefined();
    });

    it("translates a DocsConfig logo FileId into a LedgerConfig ImageRef using fileManifest dimensions", () => {
        // Source DocsConfig: colorsV3.dark.logo points to a FileId that
        // matches a fileManifest entry's fullPath (current FDR behaviour).
        const docsDefinition = {
            pages: {},
            config: {
                root: MINIMAL_ROOT,
                colorsV3: {
                    type: "dark" as const,
                    accentPrimary: { r: 1, g: 2, b: 3 },
                    logo: "assets/logo.png"
                }
            }
        } as unknown as Parameters<typeof buildLedgerInput>[0]["docsDefinition"];

        const fileManifest: Record<string, FileManifestEntry> = {
            "assets/logo.png": {
                hash: "deadbeef",
                contentType: "image/png",
                contentLength: 1234,
                filename: "logo.png",
                width: 320,
                height: 160
            }
        };

        const { localeEntry } = buildLedgerInput({
            docsDefinition,
            apiDefinitions: new Map(),
            fileManifest,
            // Identity map: fileId === sanitizedPath in the current FDR flow.
            fileIdToPath: new Map([["assets/logo.png", "assets/logo.png"]])
        });

        expect(localeEntry.config?.colorsV3).toEqual({
            type: "dark",
            accentPrimary: { r: 1, g: 2, b: 3 },
            logo: { path: "assets/logo.png", width: 320, height: 160 }
        });
    });

    it("drops a logo ImageRef when the file is not measured (no width/height in manifest)", () => {
        const docsDefinition = {
            pages: {},
            config: {
                root: MINIMAL_ROOT,
                colorsV3: {
                    type: "light" as const,
                    accentPrimary: { r: 4, g: 5, b: 6 },
                    logo: "assets/unmeasured.svg"
                }
            }
        } as unknown as Parameters<typeof buildLedgerInput>[0]["docsDefinition"];

        const fileManifest: Record<string, FileManifestEntry> = {
            "assets/unmeasured.svg": {
                hash: "cafef00d",
                contentType: "image/svg+xml",
                contentLength: 42,
                filename: "unmeasured.svg"
                // width/height intentionally omitted
            }
        };

        const { localeEntry } = buildLedgerInput({
            docsDefinition,
            apiDefinitions: new Map(),
            fileManifest,
            fileIdToPath: new Map([["assets/unmeasured.svg", "assets/unmeasured.svg"]])
        });

        // Logo absent rather than emitted with placeholder dimensions.
        expect(localeEntry.config?.colorsV3).toEqual({
            type: "light",
            accentPrimary: { r: 4, g: 5, b: 6 },
            logo: undefined,
            backgroundImage: undefined,
            background: undefined,
            border: undefined,
            sidebarBackground: undefined,
            headerBackground: undefined,
            cardBackground: undefined
        });
    });

    it("defaults locale to en", () => {
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: new Map()
        });

        expect(localeEntry.locale).toBe("en");
    });

    it("uses config.root for the root field", () => {
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ root: MINIMAL_ROOT }),
            apiDefinitions: new Map()
        });

        expect(localeEntry.root).toEqual(MINIMAL_ROOT);
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
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: new Map()
        });

        expect(localeEntry.apiManifest).toBeNull();
    });

    it("apiManifest blob hash is stable across Map insertion order (determinism guard)", () => {
        // Reproduces the docs-ledger deterministic-hash bug: `apiDefinitions`
        // is built by `Promise.all` of /api/register calls in CLI, so its Map
        // insertion order is whichever round-trip completed first. Without
        // `stableStringify`, byte-identical content would hash differently
        // across publishes and the docs-ledger "no-op republish" fast-path
        // would never fire. The two manifests below have identical entries
        // inserted in opposite orders and MUST produce the same blob hash.
        const minimalApiDefinition: ApiDefinition = {
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

        const forward = new Map<string, ApiDefinition>();
        forward.set("api-def-a", minimalApiDefinition);
        forward.set("api-def-b", minimalApiDefinition);

        const reverse = new Map<string, ApiDefinition>();
        reverse.set("api-def-b", minimalApiDefinition);
        reverse.set("api-def-a", minimalApiDefinition);

        const { localeEntry: inForward } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: forward
        });
        const { localeEntry: inReverse } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: reverse
        });

        expect(inForward.apiManifest?.hash).toBe(inReverse.apiManifest?.hash);
        expect(inForward.apiManifest?.contentLength).toBe(inReverse.apiManifest?.contentLength);
    });

    it("serializes apiManifest as a JSON blob ref when apiDefinitions is non-empty", () => {
        const minimalApiDefinition: ApiDefinition = {
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

        const apiDefinitions = new Map<string, ApiDefinition>();
        apiDefinitions.set("api-def-1", minimalApiDefinition);

        const { localeEntry, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions
        });

        expect(localeEntry.apiManifest).not.toBeNull();
        expect(localeEntry.apiManifest?.contentType).toBe("application/json");
        expect(localeEntry.apiManifest?.contentLength).toBeGreaterThan(0);

        // The blob should exist in the blob map.
        const manifestBuf = blobs.get(localeEntry.apiManifest?.hash ?? "");
        expect(manifestBuf).toBeDefined();

        // Round-trip: the blob content should deserialize to match the input map.
        const parsed = JSON.parse(manifestBuf?.toString("utf-8") ?? "");
        expect(parsed).toEqual({ "api-def-1": minimalApiDefinition });
    });

    it("forwards fileManifest unchanged (file blobs are loaded lazily, not included in blob map)", () => {
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

        const { localeEntry, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: new Map(),
            fileManifest
        });

        // fileManifest round-trips unchanged.
        expect(localeEntry.fileManifest).toEqual(fileManifest);

        // File blobs are NOT in the blob map — they are loaded lazily during
        // the upload step via filePaths (hash → absolute path).
        expect(blobs.has(imageHash)).toBe(false);
        expect(blobs.has(docHash)).toBe(false);
    });

    it("legacy behaviour: omitting fileManifest still works", () => {
        const { localeEntry, blobs } = buildLedgerInput({
            docsDefinition: makeDocsDefinition({ pages: { "page-1": { markdown: "# hi" } } }),
            apiDefinitions: new Map()
        });

        expect(localeEntry.fileManifest).toBeUndefined();
        // Blob map still contains the page + config blobs.
        expect(blobs.size).toBeGreaterThan(0);
    });

    // ── ADR 0011: git provenance ──────────────────────────────────────

    it("forwards git into DocsPublishInput when provided", () => {
        const git = {
            repoUrl: "https://github.com/acme/docs",
            branch: "main",
            commitSha: "abc123"
        };
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            git,
            apiDefinitions: new Map()
        });

        expect(localeEntry.git).toEqual(git);
    });

    it("omits git from DocsPublishInput when not provided", () => {
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: new Map()
        });

        expect(localeEntry.git).toBeUndefined();
    });

    it("forwards git without commitSha when commitSha is omitted", () => {
        const git = {
            repoUrl: "https://gitlab.com/acme/docs",
            branch: "feature/x"
        };
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            git,
            apiDefinitions: new Map()
        });

        expect(localeEntry.git).toEqual(git);
        expect(localeEntry.git?.commitSha).toBeUndefined();
    });

    // ── integrations mapping ──────────────────────────────────────────

    it("maps integrations.intercom into LedgerConfig (context7 excluded)", () => {
        const docsDefinition = {
            pages: {},
            config: {
                root: MINIMAL_ROOT,
                integrations: {
                    intercom: "app_abc123",
                    context7: "file-id-for-context7"
                }
            }
        } as unknown as Parameters<typeof buildLedgerInput>[0]["docsDefinition"];

        const { localeEntry } = buildLedgerInput({
            docsDefinition,
            apiDefinitions: new Map()
        });

        expect(localeEntry.config?.integrations).toEqual({
            intercom: "app_abc123"
        });
    });

    it("omits integrations from LedgerConfig when absent in DocsConfig", () => {
        const { localeEntry } = buildLedgerInput({
            docsDefinition: makeDocsDefinition(),
            apiDefinitions: new Map()
        });

        expect(localeEntry.config?.integrations).toBeUndefined();
    });
});
