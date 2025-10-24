import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

// Extract the SnippetDependencyTracker class for testing
class SnippetDependencyTracker {
    // Map: snippet file path -> Set of page files that reference it
    private snippetToPages = new Map<string, Set<string>>();
    // Map: page file path -> Set of snippet files it references
    private pageToSnippets = new Map<string, Set<string>>();

    constructor(private context: TaskContext) {}

    /**
     * Extract referenced markdown and code files from a markdown file
     */
    private extractReferences(
        markdown: string,
        markdownFilePath: AbsoluteFilePath,
        fernFolderPath: AbsoluteFilePath
    ): Set<string> {
        const references = new Set<string>();

        // Extract markdown references: <Markdown src="path/to/file.md" />
        const markdownRegex = /<Markdown\s+src={?['"]([^'"]+\.mdx?)['"](?! \+)}?\s*\/>/g;
        let match;
        while ((match = markdownRegex.exec(markdown)) !== null) {
            const src = match[1];
            if (src) {
                // For testing, we'll use simple path resolution
                const referencedFilePath = src.startsWith("/")
                    ? `${fernFolderPath}${src.replace(/^\//, "/")}`
                    : `${markdownFilePath.replace(/\/[^/]+$/, "")}/${src}`;
                references.add(referencedFilePath);
            }
        }

        // Extract code references: <Code src="path/to/file.js" />
        const codeRegex = /<Code(?:\s+[^>]*?)?\s+src={?['"]([^'"]+)['"](?! \+)}?((?:\s+[^>]*)?)\/>/g;
        while ((match = codeRegex.exec(markdown)) !== null) {
            const src = match[1];
            if (src) {
                const referencedFilePath = src.startsWith("/")
                    ? `${fernFolderPath}${src.replace(/^\//, "/")}`
                    : `${markdownFilePath.replace(/\/[^/]+$/, "")}/${src}`;
                references.add(referencedFilePath);
            }
        }

        return references;
    }

    /**
     * Manually add a page and its dependencies for testing
     */
    public addPageDependencies(pageFile: string, markdown: string, fernFolderPath: string): void {
        const referencedFiles = this.extractReferences(
            markdown,
            AbsoluteFilePath.of(pageFile),
            AbsoluteFilePath.of(fernFolderPath)
        );

        // Update page -> snippets mapping
        this.pageToSnippets.set(pageFile, referencedFiles);

        // Update snippet -> pages mapping
        for (const referencedFile of referencedFiles) {
            if (!this.snippetToPages.has(referencedFile)) {
                this.snippetToPages.set(referencedFile, new Set());
            }
            this.snippetToPages.get(referencedFile)!.add(pageFile);
        }
    }

    /**
     * Given a list of changed files, return all files that need to be reloaded (including dependent pages)
     */
    public getFilesToReload(changedFiles: AbsoluteFilePath[]): AbsoluteFilePath[] {
        const filesToReload = new Set<string>();

        // Add all originally changed files
        for (const file of changedFiles) {
            filesToReload.add(file);
        }

        // For each changed file, check if it's a snippet that other pages depend on
        for (const changedFile of changedFiles) {
            const dependentPages = this.snippetToPages.get(changedFile);
            if (dependentPages) {
                this.context.logger.debug(`Snippet ${changedFile} affects ${dependentPages.size} pages`);
                for (const dependentPage of dependentPages) {
                    filesToReload.add(dependentPage);
                }
            }
        }

        return Array.from(filesToReload).map(AbsoluteFilePath.of);
    }

    /**
     * Check if any of the changed files are snippets that affect other pages
     */
    public hasSnippetDependencies(changedFiles: AbsoluteFilePath[]): boolean {
        for (const file of changedFiles) {
            if (this.snippetToPages.has(file) && this.snippetToPages.get(file)!.size > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get debug info about current dependencies
     */
    public getDebugInfo(): { snippetCount: number; pageCount: number; totalDependencies: number } {
        let totalDependencies = 0;
        for (const pages of this.snippetToPages.values()) {
            totalDependencies += pages.size;
        }
        return {
            snippetCount: this.snippetToPages.size,
            pageCount: this.pageToSnippets.size,
            totalDependencies
        };
    }
}

import { beforeEach, describe, expect, test, vi } from "vitest";

describe("SnippetDependencyTracker", () => {
    let tracker: SnippetDependencyTracker;
    const mockContext = {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;

    beforeEach(() => {
        tracker = new SnippetDependencyTracker(mockContext);
    });

    test("should extract markdown references", () => {
        const markdown = `
# My Page

Here's a snippet:
<Markdown src="snippets/example.md" />

And another one:
<Markdown src="/shared/another-snippet.mdx" />
        `;

        tracker.addPageDependencies("/fern/pages/guide.md", markdown, "/fern");

        const debugInfo = tracker.getDebugInfo();
        expect(debugInfo.snippetCount).toBe(2);
        expect(debugInfo.pageCount).toBe(1);
        expect(debugInfo.totalDependencies).toBe(2);
    });

    test("should extract code references", () => {
        const markdown = `
# Code Examples

<Code src="examples/hello.py" />
<Code src="examples/world.js" maxLines={10} />
        `;

        tracker.addPageDependencies("/fern/pages/examples.md", markdown, "/fern");

        const debugInfo = tracker.getDebugInfo();
        expect(debugInfo.snippetCount).toBe(2);
        expect(debugInfo.pageCount).toBe(1);
        expect(debugInfo.totalDependencies).toBe(2);
    });

    test("should handle mixed references", () => {
        const markdown = `
# Mixed Content

<Markdown src="intro.md" />
<Code src="src/example.py" />
<Markdown src="/shared/common.mdx" />
        `;

        tracker.addPageDependencies("/fern/docs/tutorial.md", markdown, "/fern");

        const debugInfo = tracker.getDebugInfo();
        expect(debugInfo.snippetCount).toBe(3);
        expect(debugInfo.pageCount).toBe(1);
        expect(debugInfo.totalDependencies).toBe(3);
    });

    test("should track dependencies from multiple pages", () => {
        // Page 1 references snippet A
        tracker.addPageDependencies("/fern/pages/page1.md", '<Markdown src="snippets/shared.md" />', "/fern");

        // Page 2 references the same snippet A and snippet B
        tracker.addPageDependencies(
            "/fern/pages/page2.md",
            '<Markdown src="snippets/shared.md" /><Code src="examples/code.py" />',
            "/fern"
        );

        const debugInfo = tracker.getDebugInfo();
        expect(debugInfo.snippetCount).toBe(2); // shared.md and code.py
        expect(debugInfo.pageCount).toBe(2); // page1.md and page2.md
        expect(debugInfo.totalDependencies).toBe(3); // shared.md referenced by 2 pages, code.py by 1
    });

    test("should expand file list when snippet changes", () => {
        // Set up dependencies
        tracker.addPageDependencies("/fern/pages/page1.md", '<Markdown src="snippets/shared.md" />', "/fern");
        tracker.addPageDependencies("/fern/pages/page2.md", '<Markdown src="snippets/shared.md" />', "/fern");

        // Simulate a change to the shared snippet
        const changedFiles = [AbsoluteFilePath.of("/fern/pages/snippets/shared.md")];
        const filesToReload = tracker.getFilesToReload(changedFiles);

        // Should include the original snippet file plus both pages that reference it
        expect(filesToReload).toHaveLength(3);
        expect(filesToReload.map((f) => f.toString())).toContain("/fern/pages/snippets/shared.md");
        expect(filesToReload.map((f) => f.toString())).toContain("/fern/pages/page1.md");
        expect(filesToReload.map((f) => f.toString())).toContain("/fern/pages/page2.md");
    });

    test("should detect snippet dependencies", () => {
        // Set up a page that references a snippet
        tracker.addPageDependencies("/fern/pages/guide.md", '<Markdown src="snippets/intro.md" />', "/fern");

        // Test with snippet change - use the actual resolved path
        const snippetChange = [AbsoluteFilePath.of("/fern/pages/snippets/intro.md")];
        expect(tracker.hasSnippetDependencies(snippetChange)).toBe(true);

        // Test with page change
        const pageChange = [AbsoluteFilePath.of("/fern/pages/guide.md")];
        expect(tracker.hasSnippetDependencies(pageChange)).toBe(false);

        // Test with unrelated file change
        const otherChange = [AbsoluteFilePath.of("/fern/other/random.txt")];
        expect(tracker.hasSnippetDependencies(otherChange)).toBe(false);
    });

    test("should handle files with no dependencies", () => {
        const changedFiles = [AbsoluteFilePath.of("/fern/standalone.md")];
        const filesToReload = tracker.getFilesToReload(changedFiles);

        // Should only include the original file
        expect(filesToReload).toBeDefined();
        expect(filesToReload).toHaveLength(1);
        filesToReload[0] && expect(filesToReload[0].toString()).toBe("/fern/standalone.md");
    });
});
