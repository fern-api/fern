import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliContext } from "../../../cli-context/CliContext";
import { isAssetFile, shouldProcessFile, transformContentForLanguage } from "../content-transformer";
import { ContentTransformation } from "../types";

vi.mock("../translation-service", () => ({
    translateText: vi.fn(({ text }: { text: string }) => Promise.resolve(`[TRANSLATED] ${text}`))
}));

vi.mock("../yaml-processor", () => ({
    translateYamlContent: vi.fn(({ yamlContent, stub }: { yamlContent: string; stub: boolean }) => {
        // In stub mode, add slugs to YAML content but don't translate
        if (stub && yamlContent.includes("page:")) {
            const lines = yamlContent.split("\n");
            const result = [];
            for (let i = 0; i < lines.length; i++) {
                result.push(lines[i]);
                if (lines[i]?.includes("page:")) {
                    const pageName = lines[i]?.split("page:")[1]?.trim();
                    if (pageName) {
                        const slug = pageName.toLowerCase().replace(/\s+/g, "-");
                        result.push(`    slug: ${slug}`);
                    }
                }
            }
            return Promise.resolve(result.join("\n"));
        }
        return Promise.resolve(`[TRANSLATED] ${yamlContent}`);
    })
}));

describe("content-transformer", () => {
    let mockCliContext: CliContext;

    beforeEach(() => {
        mockCliContext = {
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn()
            }
        } as unknown as CliContext;

        vi.clearAllMocks();
    });

    describe("Stub Mode", () => {
        it("should process YAML files to add slugs even when stub mode is enabled", async () => {
            const originalContent = `navigation:
  - page: Hello World
    path: ./hello.mdx
`;

            const transformation: ContentTransformation = {
                filePath: "nav.yml",
                language: "es",
                sourceLanguage: "en",
                originalContent
            };

            const result = await transformContentForLanguage({
                transformation,
                cliContext: mockCliContext,
                stub: true
            });

            // YAML files should be processed in stub mode to add slugs
            expect(result).toContain("slug: hello-world");
            expect(result).toContain("page: Hello World");
            expect(mockCliContext.logger.debug).toHaveBeenCalledWith(
                "[PROCESSING] nav.yml for language: es (source: en)"
            );
        });

        it("should return content as-is for Markdown files when stub mode is enabled", async () => {
            const originalContent = "# Hello World\n\nThis is a test document.";

            const transformation: ContentTransformation = {
                filePath: "test.md",
                language: "es",
                sourceLanguage: "en",
                originalContent
            };

            const result = await transformContentForLanguage({
                transformation,
                cliContext: mockCliContext,
                stub: true
            });

            expect(result).toBe(originalContent);
            expect(mockCliContext.logger.debug).toHaveBeenCalledWith(
                "[STUB] Returning content as-is for test.md (stub mode enabled)"
            );
        });

        it("should return content as-is for MDX files when stub mode is enabled", async () => {
            const originalContent = `# Hello World

<SomeComponent prop="value" />

This is a test document.`;

            const transformation: ContentTransformation = {
                filePath: "test.mdx",
                language: "es",
                sourceLanguage: "en",
                originalContent
            };

            const result = await transformContentForLanguage({
                transformation,
                cliContext: mockCliContext,
                stub: true
            });

            expect(result).toBe(originalContent);
            expect(mockCliContext.logger.debug).toHaveBeenCalledWith(
                "[STUB] Returning content as-is for test.mdx (stub mode enabled)"
            );
        });

        it("should use translation service when stub mode is disabled", async () => {
            const originalContent = "# Hello World";

            const transformation: ContentTransformation = {
                filePath: "test.md",
                language: "es",
                sourceLanguage: "en",
                originalContent
            };

            const result = await transformContentForLanguage({
                transformation,
                cliContext: mockCliContext,
                stub: false
            });

            expect(result).toBe("[TRANSLATED] # Hello World");
        });
    });

    describe("File Type Handling", () => {
        it("should handle unsupported file types by returning original content", async () => {
            const originalContent = "some content";

            const transformation: ContentTransformation = {
                filePath: "test.txt",
                language: "es",
                sourceLanguage: "en",
                originalContent
            };

            const result = await transformContentForLanguage({
                transformation,
                cliContext: mockCliContext,
                stub: false
            });

            expect(result).toBe(originalContent);
            expect(mockCliContext.logger.debug).toHaveBeenCalledWith(
                '[SKIP] Skipping file "test.txt" - unsupported file type for translation.'
            );
        });
    });

    describe("isAssetFile", () => {
        it("should correctly identify image files as assets", () => {
            expect(isAssetFile("logo.png")).toBe(true);
            expect(isAssetFile("icon.jpg")).toBe(true);
            expect(isAssetFile("image.jpeg")).toBe(true);
            expect(isAssetFile("banner.gif")).toBe(true);
            expect(isAssetFile("graphic.svg")).toBe(true);
            expect(isAssetFile("photo.webp")).toBe(true);
            expect(isAssetFile("favicon.ico")).toBe(true);
        });

        it("should correctly identify font files as assets", () => {
            expect(isAssetFile("font.woff")).toBe(true);
            expect(isAssetFile("font.woff2")).toBe(true);
            expect(isAssetFile("font.ttf")).toBe(true);
            expect(isAssetFile("font.otf")).toBe(true);
        });

        it("should correctly identify other binary files as assets", () => {
            expect(isAssetFile("document.pdf")).toBe(true);
            expect(isAssetFile("archive.zip")).toBe(true);
            expect(isAssetFile("video.mp4")).toBe(true);
        });

        it("should not identify text files as assets", () => {
            expect(isAssetFile("document.md")).toBe(false);
            expect(isAssetFile("config.yml")).toBe(false);
            expect(isAssetFile("data.json")).toBe(false);
            expect(isAssetFile("script.js")).toBe(false);
            expect(isAssetFile("style.css")).toBe(false);
            expect(isAssetFile("readme.txt")).toBe(false);
        });

        it("should be case insensitive", () => {
            expect(isAssetFile("Logo.PNG")).toBe(true);
            expect(isAssetFile("ICON.JPG")).toBe(true);
            expect(isAssetFile("Document.PDF")).toBe(true);
        });
    });

    describe("shouldProcessFile", () => {
        it("should NOT process asset files", () => {
            expect(shouldProcessFile("logo.png", false)).toBe(false);
            expect(shouldProcessFile("icon.jpg", true)).toBe(false);
        });

        it("should process YAML files", () => {
            expect(shouldProcessFile("config.yml", false)).toBe(true);
            expect(shouldProcessFile("config.yaml", false)).toBe(true);
            expect(shouldProcessFile("config.yml", true)).toBe(true); // YAML always processed
        });

        it("should process markdown files when not in stub mode", () => {
            expect(shouldProcessFile("readme.md", false)).toBe(true);
            expect(shouldProcessFile("guide.mdx", false)).toBe(true);
        });

        it("should not process markdown files in stub mode", () => {
            expect(shouldProcessFile("readme.md", true)).toBe(false);
            expect(shouldProcessFile("guide.mdx", true)).toBe(false);
        });

        it("should process JSON files when not in stub mode", () => {
            expect(shouldProcessFile("data.json", false)).toBe(true);
        });

        it("should not process JSON files in stub mode", () => {
            expect(shouldProcessFile("data.json", true)).toBe(false);
        });

        it("should never process fern.config.json", () => {
            expect(shouldProcessFile("fern.config.json", false)).toBe(false);
            expect(shouldProcessFile("fern.config.json", true)).toBe(false);
        });

        it("should not process unknown file types", () => {
            expect(shouldProcessFile("script.js", false)).toBe(false);
            expect(shouldProcessFile("style.css", false)).toBe(false);
            expect(shouldProcessFile("readme.txt", false)).toBe(false);
        });
    });
});
