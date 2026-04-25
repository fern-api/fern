import { describe, expect, it } from "vitest";

import { applyTranslatedFrontmatterToNavTree } from "../applyTranslatedFrontmatterToNavTree.js";

describe("applyTranslatedFrontmatterToNavTree", () => {
    it("returns undefined when root is undefined", () => {
        const result = applyTranslatedFrontmatterToNavTree(undefined, {});
        expect(result).toBeUndefined();
    });

    it("returns original root when no translated pages", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "page" as const,
                pageId: "pages/getting-started.mdx",
                title: "Getting Started",
                slug: "getting-started"
            }
        };
        const result = applyTranslatedFrontmatterToNavTree(root as any, {});
        expect(result).toEqual(root);
    });

    it("applies sidebar-title override to matching page", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "page" as const,
                pageId: "pages/getting-started.mdx",
                title: "Getting Started",
                slug: "getting-started"
            }
        };
        const translatedPages = {
            "pages/getting-started.mdx": `---
sidebar-title: Premiers pas
---
# Premiers pas`
        };

        const result = applyTranslatedFrontmatterToNavTree(root as any, translatedPages);

        expect(result).toEqual({
            type: "root",
            child: {
                type: "page",
                pageId: "pages/getting-started.mdx",
                title: "Premiers pas",
                slug: "getting-started"
            }
        });
    });

    it("does not override title when no sidebar-title in frontmatter", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "page" as const,
                pageId: "pages/intro.mdx",
                title: "Introduction",
                slug: "intro"
            }
        };
        const translatedPages = {
            "pages/intro.mdx": `# Translated content without frontmatter`
        };

        const result = applyTranslatedFrontmatterToNavTree(root as any, translatedPages);

        expect(result).toEqual(root);
    });

    it("handles nested navigation structure", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "section" as const,
                title: "SDK",
                children: [
                    {
                        type: "page" as const,
                        pageId: "pages/sdk/overview.mdx",
                        title: "Overview",
                        slug: "sdk/overview"
                    },
                    {
                        type: "page" as const,
                        pageId: "pages/sdk/install.mdx",
                        title: "Installation",
                        slug: "sdk/install"
                    }
                ]
            }
        };
        const translatedPages = {
            "pages/sdk/overview.mdx": `---
sidebar-title: Vue d'ensemble
---`,
            "pages/sdk/install.mdx": `---
sidebar-title: Installation
---`
        };

        const result = applyTranslatedFrontmatterToNavTree(root as any, translatedPages);

        expect((result as any).child.children[0].title).toBe("Vue d'ensemble");
        expect((result as any).child.children[1].title).toBe("Installation");
    });

    it("ignores pages that don't match any node in the tree", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "page" as const,
                pageId: "pages/intro.mdx",
                title: "Introduction",
                slug: "intro"
            }
        };
        const translatedPages = {
            "pages/nonexistent.mdx": `---
sidebar-title: Should be ignored
---`
        };

        const result = applyTranslatedFrontmatterToNavTree(root as any, translatedPages);

        expect(result).toEqual(root);
    });

    it("handles empty sidebar-title gracefully", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "page" as const,
                pageId: "pages/test.mdx",
                title: "Test",
                slug: "test"
            }
        };
        const translatedPages = {
            "pages/test.mdx": `---
sidebar-title: ""
---`
        };

        const result = applyTranslatedFrontmatterToNavTree(root as any, translatedPages);

        // Empty sidebar-title should not override
        expect((result as any).child.title).toBe("Test");
    });

    it("trims whitespace from sidebar-title", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "page" as const,
                pageId: "pages/test.mdx",
                title: "Test",
                slug: "test"
            }
        };
        const translatedPages = {
            "pages/test.mdx": `---
sidebar-title: "  Prueba  "
---`
        };

        const result = applyTranslatedFrontmatterToNavTree(root as any, translatedPages);

        expect((result as any).child.title).toBe("Prueba");
    });

    it("handles invalid frontmatter gracefully", () => {
        const root = {
            type: "root" as const,
            child: {
                type: "page" as const,
                pageId: "pages/test.mdx",
                title: "Test",
                slug: "test"
            }
        };
        const translatedPages = {
            "pages/test.mdx": `---
invalid yaml: [
---
# Content`
        };

        // Should not throw, just return original structure
        const result = applyTranslatedFrontmatterToNavTree(root as any, translatedPages);
        expect((result as any).child.title).toBe("Test");
    });
});
