import { describe, expect, it } from "vitest";
import { mapDocsDefinitionToLegacyFileIds } from "../mapDocsDefinitionToLegacyFileIds.js";

type DocsDefinition = Parameters<typeof mapDocsDefinitionToLegacyFileIds>[0]["docsDefinition"];

describe("mapDocsDefinitionToLegacyFileIds", () => {
    it("remaps path-canonical page and config file references for V2", () => {
        const pathToFileId = new Map([
            ["docs/assets/logo.png", "legacy-logo-id"],
            ["docs/assets/diagram.svg", "legacy-diagram-id"],
            ["docs/assets/font.woff2", "legacy-font-id"]
        ]);
        const docsDefinition = {
            pages: {
                page: {
                    markdown: '![Diagram](file:docs/assets/diagram.svg)\n<img src="file:docs/assets/logo.png" />',
                    rawMarkdown: "![Diagram](file:docs/assets/diagram.svg)"
                }
            },
            config: {
                root: {
                    type: "root",
                    child: {
                        type: "sidebarRoot",
                        children: [{ type: "page", title: "Page", icon: "file:docs/assets/logo.png" }]
                    }
                },
                colorsV3: {
                    type: "dark",
                    accentPrimary: { r: 1, g: 2, b: 3 },
                    logo: "docs/assets/logo.png",
                    backgroundImage: "docs/assets/diagram.svg"
                },
                metadata: {
                    "og:image": { type: "fileId", value: "docs/assets/logo.png" },
                    "twitter:image": { type: "url", value: "https://example.com/image.png" }
                },
                typographyV2: {
                    headingsFont: {
                        type: "custom",
                        name: "Headings",
                        variants: [{ fontFile: "docs/assets/font.woff2", weight: "400" }]
                    }
                },
                js: {
                    files: [{ fileId: "docs/assets/diagram.svg", strategy: "afterInteractive" }]
                }
            }
        } as unknown as DocsDefinition;

        const remapped = mapDocsDefinitionToLegacyFileIds({ docsDefinition, pathToFileId });
        const pageId = "page" as keyof typeof remapped.pages;

        expect(remapped.pages[pageId]?.markdown).toContain("file:legacy-diagram-id");
        expect(remapped.pages[pageId]?.markdown).toContain("file:legacy-logo-id");
        expect(remapped.pages[pageId]?.rawMarkdown).toBe("![Diagram](file:legacy-diagram-id)");
        expect(remapped.config.colorsV3).toMatchObject({
            logo: "legacy-logo-id",
            backgroundImage: "legacy-diagram-id"
        });
        expect(remapped.config.metadata?.["og:image"]).toEqual({ type: "fileId", value: "legacy-logo-id" });
        expect(remapped.config.metadata?.["twitter:image"]).toEqual({
            type: "url",
            value: "https://example.com/image.png"
        });
        expect(remapped.config.typographyV2?.headingsFont?.variants[0]?.fontFile).toBe("legacy-font-id");
        expect(remapped.config.js?.files[0]?.fileId).toBe("legacy-diagram-id");
        expect(JSON.stringify(remapped.config.root)).toContain("file:legacy-logo-id");
        expect(docsDefinition.pages[pageId]?.markdown).toContain("file:docs/assets/diagram.svg");
    });

    it("remaps filenames containing spaces, parens, and special characters", () => {
        const pathToFileId = new Map([
            ["image (1).png", "uuid-spaced"],
            ["docs/assets/logo.png", "uuid-normal"],
            ["file with 'quotes'.svg", "uuid-quotes"]
        ]);
        const docsDefinition = {
            pages: {
                page: {
                    markdown:
                        '![fern](file:docs/assets/logo.png)\n![spaced](<file:image (1).png>)\n![quotes](file:file with \'quotes\'.svg)',
                    rawMarkdown: "![spaced](file:image (1).png)"
                }
            },
            config: {}
        } as unknown as DocsDefinition;

        const remapped = mapDocsDefinitionToLegacyFileIds({ docsDefinition, pathToFileId });
        const pageId = "page" as keyof typeof remapped.pages;

        expect(remapped.pages[pageId]?.markdown).toContain("file:uuid-normal");
        expect(remapped.pages[pageId]?.markdown).toContain("file:uuid-spaced");
        expect(remapped.pages[pageId]?.markdown).toContain("file:uuid-quotes");
        expect(remapped.pages[pageId]?.markdown).not.toContain("file:image (1).png");
        expect(remapped.pages[pageId]?.rawMarkdown).toBe("![spaced](file:uuid-spaced)");
    });

    it("returns the original definition when no legacy mapping exists", () => {
        const docsDefinition = {
            pages: {},
            config: {}
        } as DocsDefinition;

        expect(mapDocsDefinitionToLegacyFileIds({ docsDefinition, pathToFileId: undefined })).toBe(docsDefinition);
        expect(mapDocsDefinitionToLegacyFileIds({ docsDefinition, pathToFileId: new Map() })).toBe(docsDefinition);
    });
});
