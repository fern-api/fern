import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";

import { replaceReferencedMarkdown } from "../replaceReferencedMarkdown";

const absolutePathToFernFolder = AbsoluteFilePath.of("/path/to/fern");
const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");
const context = createMockTaskContext();

describe("replaceReferencedMarkdown", () => {
    it("should replace the referenced markdown with the content of the markdown file", async () => {
        const markdown = `
            <Markdown src="test.md" />
            <Markdown src="test2.md" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test.md")) {
                    return "test content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test2.md")) {
                    return "test2 content\nwith multiple lines";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            test content
            test2 content
            with multiple lines
        `);
    });

    it("should ignore references where the filename doesn't include md or mdx", async () => {
        const markdown = `
            <Markdown src="test.txt" />
            <Markdown src="test2" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(markdown);
    });

    it("should match on multiple formats", async () => {
        const markdown = `
            <Markdown
                src="test.md"
            />
            <Markdown src={"test2.mdx"} />
            <Markdown src='test3.md' />
            <Markdown src={'test4.md'} />
        `;

        const markdownLoader = vi.fn().mockResolvedValue("test content");

        await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader
        });

        expect(markdownLoader).toHaveBeenCalledTimes(4);
    });

    it("should substitute variables in the referenced markdown", async () => {
        const markdown = `
            <Markdown src="feature.mdx" plan="pro" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.mdx")) {
                    return "This feature is only available on the {plan} plan.";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            This feature is only available on the pro plan.
        `);
    });

    it("should substitute multiple variables in the referenced markdown", async () => {
        const markdown = `
            <Markdown src="pricing.md" tier="enterprise" price="$999" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/pricing.md")) {
                    return "The {tier} tier costs {price} per month.";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.trim()).toMatchInlineSnapshot(`"The enterprise tier costs $999 per month."`);
    });

    it("should substitute the same variable multiple times", async () => {
        const markdown = `
            <Markdown src="feature.md" name="authentication" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.md")) {
                    return "The {name} feature is powerful. Learn more about {name} in our docs.";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            The authentication feature is powerful. Learn more about authentication in our docs.
        `);
    });

    it("should handle markdown with variables and no variables mixed", async () => {
        const markdown = `
            <Markdown src="intro.md" />
            <Markdown src="feature.md" plan="pro" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/intro.md")) {
                    return "Welcome to our docs!";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.md")) {
                    return "Available on {plan} plan.";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            Welcome to our docs!
            Available on pro plan.
        `);
    });

    it("should handle variables with different quote styles", async () => {
        const markdown = `
            <Markdown src="test.md" prop1="value1" prop2='value2' prop3={"value3"} />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test.md")) {
                    return "{prop1}, {prop2}, {prop3}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            value1, value2, value3
        `);
    });

    it("should leave unreplaced variables as-is when no matching prop exists", async () => {
        const markdown = `
            <Markdown src="test.md" plan="pro" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test.md")) {
                    return "Plan: {plan}, Tier: {tier}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            Plan: pro, Tier: {tier}
        `);
    });

    it("should handle multiline markdown with variables", async () => {
        const markdown = `
            <Markdown src="feature.md" name="API Keys" level="enterprise" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.md")) {
                    return "# {name}\n\nThis feature is available on the {level} plan.\n\nLearn more about {name} below.";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.trim()).toMatchInlineSnapshot(`
          "# API Keys
                      
                      This feature is available on the enterprise plan.
                      
                      Learn more about API Keys below."
        `);
    });

    it("should warn when snippet references a missing variable", async () => {
        const warnSpy = vi.fn();
        const testContext = createMockTaskContext({
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: warnSpy,
                error: vi.fn()
            }
        });

        const markdown = `
            <Markdown src="plan-tier.mdx" plan="pro" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/plan-tier.mdx")) {
                    return "Plan: {plan}, Tier: {tier}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/test\.mdx:\d+ Markdown snippet missing property: `tier`/)
        );
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(result.trim()).toBe("Plan: pro, Tier: {tier}");
    });

    it("should warn for multiple missing variables", async () => {
        const warnSpy = vi.fn();
        const testContext = createMockTaskContext({
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: warnSpy,
                error: vi.fn()
            }
        });

        const markdown = `
            <Markdown src="details.md" name="API" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/details.md")) {
                    return "{name} - Plan: {plan}, Tier: {tier}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/test\.mdx:\d+ Markdown snippet missing property: `plan`/)
        );
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/test\.mdx:\d+ Markdown snippet missing property: `tier`/)
        );
        expect(warnSpy).toHaveBeenCalledTimes(2);
        expect(result.trim()).toBe("API - Plan: {plan}, Tier: {tier}");
    });

    it("should not warn when all variables are provided", async () => {
        const warnSpy = vi.fn();
        const testContext = createMockTaskContext({
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: warnSpy,
                error: vi.fn()
            }
        });

        const markdown = `
            <Markdown src="plan-tier.mdx" plan="pro" tier="enterprise" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/plan-tier.mdx")) {
                    return "Plan: {plan}, Tier: {tier}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).not.toHaveBeenCalled();
        expect(result.trim()).toBe("Plan: pro, Tier: enterprise");
    });

    it("should not warn when snippet has no variables", async () => {
        const warnSpy = vi.fn();
        const testContext = createMockTaskContext({
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: warnSpy,
                error: vi.fn()
            }
        });

        const markdown = `
            <Markdown src="static.md" plan="pro" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/static.md")) {
                    return "This is static content with no variables.";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).not.toHaveBeenCalled();
        expect(result.trim()).toBe("This is static content with no variables.");
    });
});
