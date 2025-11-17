import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliContext } from "../../../cli-context/CliContext";
import { transformContentForLanguage } from "../content-transformer";
import { ContentTransformation } from "../types";

vi.mock("../translation-service", () => ({
    translateText: vi.fn(({ text }: { text: string }) => Promise.resolve(`[TRANSLATED] ${text}`))
}));

vi.mock("../yaml-processor", () => ({
    translateYamlContent: vi.fn((content: string, stub: boolean) => {
        // In stub mode, add slugs to YAML content but don't translate
        if (stub && content.includes("page:")) {
            const lines = content.split("\n");
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
        return Promise.resolve(`[TRANSLATED] ${content}`);
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

            const result = await transformContentForLanguage(transformation, mockCliContext, true);

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

            const result = await transformContentForLanguage(transformation, mockCliContext, true);

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

            const result = await transformContentForLanguage(transformation, mockCliContext, true);

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

            const result = await transformContentForLanguage(transformation, mockCliContext, false);

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

            const result = await transformContentForLanguage(transformation, mockCliContext, false);

            expect(result).toBe(originalContent);
            expect(mockCliContext.logger.info).toHaveBeenCalledWith(
                '[SKIP] Skipping file "test.txt" - unsupported file type for translation.'
            );
        });
    });
});
