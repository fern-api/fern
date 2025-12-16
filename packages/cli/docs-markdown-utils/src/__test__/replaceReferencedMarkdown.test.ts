import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";

import { replaceReferencedMarkdown } from "../replaceReferencedMarkdown";

const absolutePathToFernFolder = AbsoluteFilePath.of("/path/to/fern");
const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");
const context = createMockTaskContext();

function makeContextWithWarnSpy() {
    const warnSpy = vi.fn();
    const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: warnSpy,
        error: vi.fn(),
        trace: vi.fn(),
        log: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn()
    };
    const testContext = createMockTaskContext({ logger });
    return { context: testContext, warnSpy };
}

describe("replaceReferencedMarkdown", () => {
    it("should replace the referenced markdown with the content of the markdown file", async () => {
        const markdown = `
            <Markdown src="test.md" />
            <Markdown src="test2.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
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

        const { markdown: result } = await replaceReferencedMarkdown({
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

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.mdx")) {
                    return "This feature is only available on the {{plan}} plan.";
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

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/pricing.md")) {
                    return "The {{tier}} tier costs {{price}} per month.";
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

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.md")) {
                    return "The {{name}} feature is powerful. Learn more about {{name}} in our docs.";
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

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/intro.md")) {
                    return "Welcome to our docs!";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.md")) {
                    return "Available on {{plan}} plan.";
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

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test.md")) {
                    return "{{prop1}}, {{prop2}}, {{prop3}}";
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

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test.md")) {
                    return "Plan: {{plan}}, Tier: {{tier}}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            Plan: pro, Tier: {{tier}}
        `);
    });

    it("should handle multiline markdown with variables", async () => {
        const markdown = `
            <Markdown src="feature.md" name="API Keys" level="enterprise" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.md")) {
                    return "# {{name}}\n\nThis feature is available on the {{level}} plan.\n\nLearn more about {{name}} below.";
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
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="plan-tier.mdx" plan="pro" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/plan-tier.mdx")) {
                    return "Plan: {{plan}}, Tier: {{tier}}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(
                /\[\/path\/to\/fern\/pages\/test\.mdx:\d+\] Markdown snippet missing property: `tier`/
            )
        );
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(result.trim()).toBe("Plan: pro, Tier: {{tier}}");
    });

    it("should warn for multiple missing variables", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="details.md" name="API" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/details.md")) {
                    return "{{name}} - Plan: {{plan}}, Tier: {{tier}}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(
                /\[\/path\/to\/fern\/pages\/test\.mdx:\d+\] Markdown snippet missing property: `plan`/
            )
        );
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(
                /\[\/path\/to\/fern\/pages\/test\.mdx:\d+\] Markdown snippet missing property: `tier`/
            )
        );
        expect(warnSpy).toHaveBeenCalledTimes(2);
        expect(result.trim()).toBe("API - Plan: {{plan}}, Tier: {{tier}}");
    });

    it("should not warn when all variables are provided", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="plan-tier.mdx" plan="pro" tier="enterprise" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/plan-tier.mdx")) {
                    return "Plan: {{plan}}, Tier: {{tier}}";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).not.toHaveBeenCalled();
        expect(result.trim()).toBe("Plan: pro, Tier: enterprise");
    });

    it("should not warn when snippet has no variables", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="static.md" plan="pro" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
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

    it("should recursively replace nested markdown snippets", async () => {
        const markdown = `
            <Markdown src="outer.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/outer.md")) {
                    return 'Outer content\n<Markdown src="inner.md" />\nMore outer content';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/inner.md")) {
                    return "Inner content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.trim()).toBe("Outer content\n            Inner content\n            More outer content");
    });

    it("should recursively replace deeply nested markdown snippets", async () => {
        const markdown = `
            <Markdown src="level1.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/level1.md")) {
                    return 'Level 1\n<Markdown src="level2.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/level2.md")) {
                    return 'Level 2\n<Markdown src="level3.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/level3.md")) {
                    return "Level 3";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.trim()).toContain("Level 1");
        expect(result.trim()).toContain("Level 2");
        expect(result.trim()).toContain("Level 3");
    });

    it("should detect and warn about circular references (A -> B -> A)", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="snippetA.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetA.md")) {
                    return 'Content A\n<Markdown src="snippetB.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetB.md")) {
                    return 'Content B\n<Markdown src="snippetA.md" />';
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Circular reference detected.*snippetA\.md.*already being processed/)
        );
        expect(result.trim()).toContain("Content A");
        expect(result.trim()).toContain("Content B");
    });

    it("should detect and warn about self-referencing snippets", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="self-ref.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/self-ref.md")) {
                    return 'Self content\n<Markdown src="self-ref.md" />';
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Circular reference detected.*self-ref\.md.*already being processed/)
        );
        expect(result.trim()).toContain("Self content");
    });

    it("should handle recursive snippets with variable substitution", async () => {
        const markdown = `
            <Markdown src="outer.md" name="Fern" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/outer.md")) {
                    return 'Welcome to {{name}}!\n<Markdown src="inner.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/inner.md")) {
                    return "Inner content here";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.trim()).toContain("Welcome to Fern!");
        expect(result.trim()).toContain("Inner content here");
    });

    it("should handle multiple snippets at the same level with one being circular", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="parent.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/parent.md")) {
                    return 'Parent\n<Markdown src="child1.md" />\n<Markdown src="child2.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/child1.md")) {
                    return 'Child 1\n<Markdown src="parent.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/child2.md")) {
                    return "Child 2";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Circular reference detected.*parent\.md.*already being processed/)
        );
        expect(result.trim()).toContain("Parent");
        expect(result.trim()).toContain("Child 1");
        expect(result.trim()).toContain("Child 2");
    });

    it("should detect circular references in longer chains (A -> B -> C -> A)", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="snippetA.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetA.md")) {
                    return 'Content A\n<Markdown src="snippetB.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetB.md")) {
                    return 'Content B\n<Markdown src="snippetC.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetC.md")) {
                    return 'Content C\n<Markdown src="snippetA.md" />';
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Circular reference detected.*snippetA\.md.*already being processed/)
        );
        expect(result.trim()).toContain("Content A");
        expect(result.trim()).toContain("Content B");
        expect(result.trim()).toContain("Content C");
    });

    it("should detect circular references that don't go back to the first snippet (A -> B -> C -> B)", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="snippetA.md" />
        `;

        const { markdown: result } = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetA.md")) {
                    return 'Content A\n<Markdown src="snippetB.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetB.md")) {
                    return 'Content B\n<Markdown src="snippetC.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetC.md")) {
                    return 'Content C\n<Markdown src="snippetB.md" />';
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Circular reference detected.*snippetB\.md.*already being processed/)
        );
        expect(result.trim()).toContain("Content A");
        expect(result.trim()).toContain("Content B");
        expect(result.trim()).toContain("Content C");
    });

    it("should track referenced markdown files with their paths and raw content", async () => {
        const markdown = `
            <Markdown src="snippet.md" />
            <Markdown src="nested/other.mdx" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippet.md")) {
                    return "Snippet content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/nested/other.mdx")) {
                    return "Other content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.markdown).toContain("Snippet content");
        expect(result.markdown).toContain("Other content");

        expect(result.referencedFiles).toHaveLength(2);

        expect(result.referencedFiles).toEqual(
            expect.arrayContaining([
                {
                    absoluteFilePath: AbsoluteFilePath.of("/path/to/fern/pages/snippet.md"),
                    relativeFilePath: RelativeFilePath.of("pages/snippet.md"),
                    content: "Snippet content"
                },
                {
                    absoluteFilePath: AbsoluteFilePath.of("/path/to/fern/pages/nested/other.mdx"),
                    relativeFilePath: RelativeFilePath.of("pages/nested/other.mdx"),
                    content: "Other content"
                }
            ])
        );
    });

    it("should deduplicate referenced files when the same file is referenced multiple times", async () => {
        const markdown = `
            <Markdown src="snippet.md" />
            <Markdown src="snippet.md" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippet.md")) {
                    return "Snippet content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.referencedFiles).toHaveLength(1);
        expect(result.referencedFiles[0]).toEqual({
            absoluteFilePath: AbsoluteFilePath.of("/path/to/fern/pages/snippet.md"),
            relativeFilePath: RelativeFilePath.of("pages/snippet.md"),
            content: "Snippet content"
        });
    });

    it("should store raw content before variable substitution in referenced files", async () => {
        const markdown = `
            <Markdown src="feature.md" plan="pro" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/feature.md")) {
                    return "This feature is only available on the {{plan}} plan.";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result.markdown).toContain("This feature is only available on the pro plan.");

        expect(result.referencedFiles).toHaveLength(1);
        expect(result.referencedFiles[0]?.content).toBe("This feature is only available on the {{plan}} plan.");
    });

    it("should track all referenced files even when circular references are detected", async () => {
        const { context: testContext, warnSpy } = makeContextWithWarnSpy();

        const markdown = `
            <Markdown src="snippetA.md" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context: testContext,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetA.md")) {
                    return 'Content A\n<Markdown src="snippetB.md" />';
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/snippetB.md")) {
                    return 'Content B\n<Markdown src="snippetA.md" />'; // Circular!
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        // Circular reference should be detected
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Circular reference detected.*snippetA\.md.*already being processed/)
        );

        // Both files should still be tracked in referencedFiles
        expect(result.referencedFiles).toHaveLength(2);
        expect(result.referencedFiles).toEqual(
            expect.arrayContaining([
                {
                    absoluteFilePath: AbsoluteFilePath.of("/path/to/fern/pages/snippetA.md"),
                    relativeFilePath: RelativeFilePath.of("pages/snippetA.md"),
                    content: 'Content A\n<Markdown src="snippetB.md" />'
                },
                {
                    absoluteFilePath: AbsoluteFilePath.of("/path/to/fern/pages/snippetB.md"),
                    relativeFilePath: RelativeFilePath.of("pages/snippetB.md"),
                    content: 'Content B\n<Markdown src="snippetA.md" />'
                }
            ])
        );
    });
});
