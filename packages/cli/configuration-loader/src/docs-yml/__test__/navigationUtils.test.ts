import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import {
    buildNavigationForDirectory,
    getFrontmatterPosition,
    getFrontmatterTitle,
    nameToSlug,
    nameToTitle
} from "../navigationUtils.js";

describe("nameToSlug", () => {
    it("should convert filename with .md extension to slug", () => {
        expect(nameToSlug({ name: "getting-started.md" })).toBe("getting-started");
    });

    it("should convert filename with .mdx extension to slug", () => {
        expect(nameToSlug({ name: "api-reference.mdx" })).toBe("api-reference");
    });

    it("should convert spaces to hyphens", () => {
        expect(nameToSlug({ name: "Foo Bar.md" })).toBe("foo-bar");
    });

    it("should convert to lowercase", () => {
        expect(nameToSlug({ name: "README.md" })).toBe("readme");
    });

    it("should handle underscores", () => {
        expect(nameToSlug({ name: "api_reference.md" })).toBe("apireference");
    });

    it("should remove special characters except hyphens", () => {
        expect(nameToSlug({ name: "hello-world!@#.md" })).toBe("hello-world");
    });

    it("should handle filename without extension", () => {
        expect(nameToSlug({ name: "getting-started" })).toBe("getting-started");
    });

    it("should collapse multiple spaces to single hyphen", () => {
        expect(nameToSlug({ name: "foo   bar.md" })).toBe("foo-bar");
    });
});

describe("nameToTitle", () => {
    it("should convert filename with .md extension to title", () => {
        expect(nameToTitle({ name: "getting-started.md" })).toBe("Getting Started");
    });

    it("should convert filename with .mdx extension to title", () => {
        expect(nameToTitle({ name: "api-reference.mdx" })).toBe("Api Reference");
    });

    it("should replace hyphens with spaces", () => {
        expect(nameToTitle({ name: "hello-world.md" })).toBe("Hello World");
    });

    it("should replace underscores with spaces", () => {
        expect(nameToTitle({ name: "api_reference.md" })).toBe("Api Reference");
    });

    it("should capitalize first letter of each word", () => {
        expect(nameToTitle({ name: "readme.md" })).toBe("Readme");
    });

    it("should handle filename without extension", () => {
        expect(nameToTitle({ name: "getting-started" })).toBe("Getting Started");
    });

    it("should handle mixed case", () => {
        expect(nameToTitle({ name: "APIReference.md" })).toBe("APIReference");
    });
});

describe("buildNavigationForDirectory", () => {
    it("should build navigation for directory with markdown files", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "getting-started.md",
                absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "api-reference.mdx",
                absolutePath: "/test/api-reference.mdx" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
            type: "page",
            title: "Api Reference",
            slug: "api-reference",
            absolutePath: "/test/api-reference.mdx"
        });
        expect(result[1]).toMatchObject({
            type: "page",
            title: "Getting Started",
            slug: "getting-started",
            absolutePath: "/test/getting-started.md"
        });
    });

    it("should ignore non-markdown files", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "getting-started.md",
                absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "image.png",
                absolutePath: "/test/image.png" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: "page",
            title: "Getting Started",
            slug: "getting-started"
        });
    });

    it("should create nested sections for subdirectories", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "file" as const,
                        name: "getting-started.md",
                        absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "directory" as const,
                        name: "advanced",
                        absolutePath: "/test/advanced" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else {
                return [
                    {
                        type: "file" as const,
                        name: "authentication.mdx",
                        absolutePath: "/test/advanced/authentication.mdx" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toBeDefined();
        expect(result[0]).toMatchObject({
            type: "section",
            title: "Advanced",
            slug: "advanced"
        });
        const firstItem = result[0];
        expect.assert(firstItem?.type === "section");
        expect(firstItem.contents).toHaveLength(1);
        expect(firstItem.contents[0]).toMatchObject({
            type: "page",
            title: "Authentication",
            slug: "authentication"
        });
        expect(result[1]).toMatchObject({
            type: "page",
            title: "Getting Started",
            slug: "getting-started"
        });
    });

    it("should sort items alphabetically by title (case-insensitive)", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "zebra.md",
                absolutePath: "/test/zebra.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "apple.md",
                absolutePath: "/test/apple.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "Banana.md",
                absolutePath: "/test/Banana.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ title: "Apple" });
        expect(result[1]).toMatchObject({ title: "Banana" });
        expect(result[2]).toMatchObject({ title: "Zebra" });
    });

    it("should handle two-level nesting", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 2) {
                return [
                    {
                        type: "directory" as const,
                        name: "advanced",
                        absolutePath: "/test/guides/advanced" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else {
                return [
                    {
                        type: "file" as const,
                        name: "authentication.md",
                        absolutePath: "/test/guides/advanced/authentication.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toBeDefined();
        expect(result[0]).toMatchObject({
            type: "section",
            title: "Guides",
            slug: "guides"
        });
        const firstItem = result[0];
        expect.assert(firstItem?.type === "section");
        expect(firstItem.contents).toHaveLength(1);
        expect(firstItem.contents[0]).toMatchObject({
            type: "section",
            title: "Advanced",
            slug: "advanced"
        });
        const secondItem = firstItem.contents[0];
        expect.assert(secondItem?.type === "section");
        expect(secondItem.contents).toHaveLength(1);
        expect(secondItem.contents[0]).toMatchObject({
            type: "page",
            title: "Authentication",
            slug: "authentication"
        });
    });
});

describe("getFrontmatterPosition", () => {
    it("should extract numeric position from frontmatter", async () => {
        const mockReadFile = async () => "---\nposition: 5\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBe(5);
    });

    it("should extract numeric string position from frontmatter", async () => {
        const mockReadFile = async () => "---\nposition: '10'\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBe(10);
    });

    it("should return undefined for missing position", async () => {
        const mockReadFile = async () => "---\ntitle: Test\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should return undefined for invalid position (non-numeric string)", async () => {
        const mockReadFile = async () => "---\nposition: 'foo'\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should accept negative position values", async () => {
        const mockReadFile = async () => "---\nposition: -5\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBe(-5);
    });

    it("should accept zero as position", async () => {
        const mockReadFile = async () => "---\nposition: 0\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBe(0);
    });

    it("should return undefined for NaN", async () => {
        const mockReadFile = async () => "---\nposition: NaN\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should return undefined for Infinity", async () => {
        const mockReadFile = async () => "---\nposition: Infinity\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should return undefined when file read fails", async () => {
        const mockReadFile = async () => {
            throw new Error("File not found");
        };
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should return undefined when frontmatter parsing fails", async () => {
        const mockReadFile = async () => "---\ninvalid: yaml: content\n---";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should accept decimal position values", async () => {
        const mockReadFile = async () => "---\nposition: 1.5\n---\n# Content";
        const result = await getFrontmatterPosition({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBe(1.5);
    });
});

describe("getFrontmatterTitle", () => {
    it("should extract title from frontmatter", async () => {
        const mockReadFile = async () => "---\ntitle: My Custom Title\n---\n# Content";
        const result = await getFrontmatterTitle({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBe("My Custom Title");
    });

    it("should return undefined for missing title", async () => {
        const mockReadFile = async () => "---\nposition: 1\n---\n# Content";
        const result = await getFrontmatterTitle({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should return undefined for empty title", async () => {
        const mockReadFile = async () => "---\ntitle: ''\n---\n# Content";
        const result = await getFrontmatterTitle({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should return undefined for whitespace-only title", async () => {
        const mockReadFile = async () => "---\ntitle: '   '\n---\n# Content";
        const result = await getFrontmatterTitle({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should trim whitespace from title", async () => {
        const mockReadFile = async () => "---\ntitle: '  My Title  '\n---\n# Content";
        const result = await getFrontmatterTitle({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBe("My Title");
    });

    it("should return undefined when file read fails", async () => {
        const mockReadFile = async () => {
            throw new Error("File not found");
        };
        const result = await getFrontmatterTitle({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });

    it("should return undefined for non-string title", async () => {
        const mockReadFile = async () => "---\ntitle: 123\n---\n# Content";
        const result = await getFrontmatterTitle({
            absolutePath: "/test/file.md" as AbsoluteFilePath,
            readFileFn: mockReadFile
        });
        expect(result).toBeUndefined();
    });
});

describe("buildNavigationForDirectory with frontmatter title (title-source: frontmatter)", () => {
    it("should use frontmatter title for pages when titleSource is frontmatter", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "getting-started.md",
                absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "api-reference.mdx",
                absolutePath: "/test/api-reference.mdx" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/getting-started.md") {
                return "---\ntitle: Quick Start Guide\n---\n# Content";
            }
            if (path === "/test/api-reference.mdx") {
                return "---\ntitle: API Documentation\n---\n# Content";
            }
            return "---\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            titleSource: "frontmatter",
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ title: "API Documentation" });
        expect(result[1]).toMatchObject({ title: "Quick Start Guide" });
    });

    it("should use filename-based title by default (no titleSource)", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "getting-started.md",
                absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "api-reference.mdx",
                absolutePath: "/test/api-reference.mdx" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/getting-started.md") {
                return "---\ntitle: Quick Start Guide\n---\n# Content";
            }
            if (path === "/test/api-reference.mdx") {
                return "---\ntitle: API Documentation\n---\n# Content";
            }
            return "---\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ title: "Api Reference" });
        expect(result[1]).toMatchObject({ title: "Getting Started" });
    });

    it("should use filename-based title when titleSource is filename", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "getting-started.md",
                absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async () => "---\ntitle: Quick Start Guide\n---\n# Content";

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            titleSource: "filename",
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ title: "Getting Started" });
    });

    it("should fall back to file name when frontmatter title is not available", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "getting-started.md",
                absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async () => "---\nposition: 1\n---\n# Content";

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            titleSource: "frontmatter",
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ title: "Getting Started" });
    });

    it("should use index page frontmatter title for section title when titleSource is frontmatter", async () => {
        let callCount = 0;
        const mockGetDir = async () => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/guides/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "authentication.md",
                        absolutePath: "/test/guides/authentication.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            }
        };

        const mockReadFile = async (path: string) => {
            if (path === "/test/guides/index.mdx") {
                return "---\ntitle: User Guides\n---\n# Content";
            }
            return "---\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            titleSource: "frontmatter",
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: "section",
            title: "User Guides",
            overviewAbsolutePath: "/test/guides/index.mdx"
        });
    });

    it("should use directory name for section title by default (no titleSource)", async () => {
        let callCount = 0;
        const mockGetDir = async () => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/guides/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "authentication.md",
                        absolutePath: "/test/guides/authentication.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            }
        };

        const mockReadFile = async (path: string) => {
            if (path === "/test/guides/index.mdx") {
                return "---\ntitle: User Guides\n---\n# Content";
            }
            return "---\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: "section",
            title: "Guides",
            overviewAbsolutePath: "/test/guides/index.mdx"
        });
    });
});

describe("buildNavigationForDirectory with position-based sorting", () => {
    it("should sort pages with position before pages without position", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "a.md",
                absolutePath: "/test/a.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "b.md",
                absolutePath: "/test/b.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "c.md",
                absolutePath: "/test/c.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "d.md",
                absolutePath: "/test/d.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "e.md",
                absolutePath: "/test/e.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/a.md") {
                return "---\nposition: 1\n---\n# A";
            }
            if (path === "/test/d.md") {
                return "---\nposition: 99\n---\n# D";
            }
            return "---\ntitle: Test\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(5);
        expect(result[0]).toMatchObject({ title: "A" });
        expect(result[1]).toMatchObject({ title: "D" });
        expect(result[2]).toMatchObject({ title: "B" });
        expect(result[3]).toMatchObject({ title: "C" });
        expect(result[4]).toMatchObject({ title: "E" });
    });

    it("should sort pages with same position alphabetically", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "zebra.md",
                absolutePath: "/test/zebra.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "apple.md",
                absolutePath: "/test/apple.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "banana.md",
                absolutePath: "/test/banana.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async () => "---\nposition: 1\n---\n# Content";

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ title: "Apple" });
        expect(result[1]).toMatchObject({ title: "Banana" });
        expect(result[2]).toMatchObject({ title: "Zebra" });
    });

    it("should handle negative position values", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "a.md",
                absolutePath: "/test/a.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "b.md",
                absolutePath: "/test/b.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "c.md",
                absolutePath: "/test/c.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/a.md") {
                return "---\nposition: -5\n---\n# A";
            }
            if (path === "/test/b.md") {
                return "---\nposition: 2\n---\n# B";
            }
            return "---\ntitle: Test\n---\n# C";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ title: "A" });
        expect(result[1]).toMatchObject({ title: "B" });
        expect(result[2]).toMatchObject({ title: "C" });
    });

    it("should place sections with pages without position in alphabetical order", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "file" as const,
                        name: "zebra.md",
                        absolutePath: "/test/zebra.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "apple.md",
                        absolutePath: "/test/apple.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else {
                return [];
            }
        };

        const mockReadFile = async (path: string) => {
            if (path === "/test/apple.md") {
                return "---\nposition: 1\n---\n# Apple";
            }
            return "---\ntitle: Test\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ title: "Apple", type: "page" });
        expect(result[1]).toMatchObject({ title: "Guides", type: "section" });
        expect(result[2]).toMatchObject({ title: "Zebra", type: "page" });
    });

    it("should handle numeric string positions", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "a.md",
                absolutePath: "/test/a.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "b.md",
                absolutePath: "/test/b.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/a.md") {
                return "---\nposition: '10'\n---\n# A";
            }
            if (path === "/test/b.md") {
                return "---\nposition: 5\n---\n# B";
            }
            return "---\ntitle: Test\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ title: "B" });
        expect(result[1]).toMatchObject({ title: "A" });
    });

    it("should treat invalid position values as undefined", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "a.md",
                absolutePath: "/test/a.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "b.md",
                absolutePath: "/test/b.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "c.md",
                absolutePath: "/test/c.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/a.md") {
                return "---\nposition: 'foo'\n---\n# A";
            }
            if (path === "/test/b.md") {
                return "---\nposition: 1\n---\n# B";
            }
            return "---\ntitle: Test\n---\n# C";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ title: "B" });
        expect(result[1]).toMatchObject({ title: "A" });
        expect(result[2]).toMatchObject({ title: "C" });
    });

    it("should handle MDX files with frontmatter", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "a.mdx",
                absolutePath: "/test/a.mdx" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "b.mdx",
                absolutePath: "/test/b.mdx" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/a.mdx") {
                return "---\nposition: 2\n---\n# A";
            }
            if (path === "/test/b.mdx") {
                return "---\nposition: 1\n---\n# B";
            }
            return "---\ntitle: Test\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ title: "B" });
        expect(result[1]).toMatchObject({ title: "A" });
    });

    it("should handle decimal position values", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "a.md",
                absolutePath: "/test/a.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "b.md",
                absolutePath: "/test/b.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "c.md",
                absolutePath: "/test/c.md" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const mockReadFile = async (path: string) => {
            if (path === "/test/a.md") {
                return "---\nposition: 1.5\n---\n# A";
            }
            if (path === "/test/b.md") {
                return "---\nposition: 1\n---\n# B";
            }
            if (path === "/test/c.md") {
                return "---\nposition: 2\n---\n# C";
            }
            return "---\ntitle: Test\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ title: "B" });
        expect(result[1]).toMatchObject({ title: "A" });
        expect(result[2]).toMatchObject({ title: "C" });
    });
});

describe("buildNavigationForDirectory with index.mdx as section overview", () => {
    it("should use index.mdx as section overview for subdirectories", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 2) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/guides/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "getting-started.md",
                        absolutePath: "/test/guides/getting-started.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        const section = result[0];
        expect(section).toMatchObject({
            type: "section",
            title: "Guides",
            slug: "guides",
            overviewAbsolutePath: "/test/guides/index.mdx"
        });
        expect.assert(section?.type === "section");
        expect(section.contents).toHaveLength(1);
        expect(section.contents[0]).toMatchObject({
            type: "page",
            title: "Getting Started",
            slug: "getting-started"
        });
    });

    it("should use index.md as section overview for subdirectories", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 2) {
                return [
                    {
                        type: "file" as const,
                        name: "index.md",
                        absolutePath: "/test/guides/index.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "authentication.mdx",
                        absolutePath: "/test/guides/authentication.mdx" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        const section = result[0];
        expect(section).toMatchObject({
            type: "section",
            title: "Guides",
            slug: "guides",
            overviewAbsolutePath: "/test/guides/index.md"
        });
        expect.assert(section?.type === "section");
        expect(section.contents).toHaveLength(1);
        expect(section.contents[0]).toMatchObject({
            type: "page",
            title: "Authentication"
        });
    });

    it("should exclude index.mdx from section contents", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "api",
                        absolutePath: "/test/api" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 2) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/api/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "endpoints.md",
                        absolutePath: "/test/api/endpoints.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "errors.md",
                        absolutePath: "/test/api/errors.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        const section = result[0];
        expect.assert(section?.type === "section");
        expect(section.contents).toHaveLength(2);
        const titles = section.contents.map((item) => (item.type === "page" ? item.title : ""));
        expect(titles).not.toContain("Index");
        expect(titles).toContain("Endpoints");
        expect(titles).toContain("Errors");
    });

    it("should handle nested subdirectories with index.mdx", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 2) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/guides/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "directory" as const,
                        name: "advanced",
                        absolutePath: "/test/guides/advanced" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 3) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/guides/advanced/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "auth.md",
                        absolutePath: "/test/guides/advanced/auth.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        const guidesSection = result[0];
        expect(guidesSection).toMatchObject({
            type: "section",
            title: "Guides",
            overviewAbsolutePath: "/test/guides/index.mdx"
        });
        expect.assert(guidesSection?.type === "section");
        expect(guidesSection.contents).toHaveLength(1);
        const advancedSection = guidesSection.contents[0];
        expect(advancedSection).toMatchObject({
            type: "section",
            title: "Advanced",
            overviewAbsolutePath: "/test/guides/advanced/index.mdx"
        });
        expect.assert(advancedSection?.type === "section");
        expect(advancedSection.contents).toHaveLength(1);
        expect(advancedSection.contents[0]).toMatchObject({
            type: "page",
            title: "Auth"
        });
    });

    it("should handle case-insensitive index file names", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 2) {
                return [
                    {
                        type: "file" as const,
                        name: "INDEX.MDX",
                        absolutePath: "/test/guides/INDEX.MDX" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/guides/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        const section = result[0];
        expect(section).toMatchObject({
            type: "section",
            overviewAbsolutePath: "/test/guides/INDEX.MDX"
        });
        expect.assert(section?.type === "section");
        expect(section.contents).toHaveLength(1);
        expect(section.contents[0]).toMatchObject({
            type: "page",
            title: "Page"
        });
    });

    it("should not set overviewAbsolutePath when no index file exists", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (callCount === 2) {
                return [
                    {
                        type: "file" as const,
                        name: "getting-started.md",
                        absolutePath: "/test/guides/getting-started.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        const section = result[0];
        expect(section).toMatchObject({
            type: "section",
            title: "Guides",
            overviewAbsolutePath: undefined
        });
        expect.assert(section?.type === "section");
        expect(section.contents).toHaveLength(1);
    });
});

describe("buildNavigationForDirectory with section position from index file", () => {
    it("should sort sections based on position from index file frontmatter", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "zebra-section",
                        absolutePath: "/test/zebra-section" as AbsoluteFilePath,
                        contents: []
                    },
                    {
                        type: "directory" as const,
                        name: "alpha-section",
                        absolutePath: "/test/alpha-section" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (path === ("/test/zebra-section" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/zebra-section/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/zebra-section/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else if (path === ("/test/alpha-section" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/alpha-section/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/alpha-section/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const mockReadFile = async (path: string) => {
            if (path === "/test/zebra-section/index.mdx") {
                return "---\nposition: 1\n---\n# Zebra Section";
            }
            if (path === "/test/alpha-section/index.mdx") {
                return "---\nposition: 2\n---\n# Alpha Section";
            }
            return "---\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: "section", title: "Zebra Section" });
        expect(result[1]).toMatchObject({ type: "section", title: "Alpha Section" });
    });

    it("should sort sections with position before sections without position", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "alpha-section",
                        absolutePath: "/test/alpha-section" as AbsoluteFilePath,
                        contents: []
                    },
                    {
                        type: "directory" as const,
                        name: "zebra-section",
                        absolutePath: "/test/zebra-section" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (path === ("/test/alpha-section" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/alpha-section/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else if (path === ("/test/zebra-section" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/zebra-section/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/zebra-section/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const mockReadFile = async (path: string) => {
            if (path === "/test/zebra-section/index.mdx") {
                return "---\nposition: 1\n---\n# Zebra Section";
            }
            return "---\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: "section", title: "Zebra Section" });
        expect(result[1]).toMatchObject({ type: "section", title: "Alpha Section" });
    });

    it("should sort pages and sections together based on position", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "file" as const,
                        name: "page-a.md",
                        absolutePath: "/test/page-a.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "directory" as const,
                        name: "section-b",
                        absolutePath: "/test/section-b" as AbsoluteFilePath,
                        contents: []
                    },
                    {
                        type: "file" as const,
                        name: "page-c.md",
                        absolutePath: "/test/page-c.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else if (path === ("/test/section-b" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "index.mdx",
                        absolutePath: "/test/section-b/index.mdx" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const mockReadFile = async (path: string) => {
            if (path === "/test/page-a.md") {
                return "---\nposition: 3\n---\n# Page A";
            }
            if (path === "/test/section-b/index.mdx") {
                return "---\nposition: 1\n---\n# Section B";
            }
            if (path === "/test/page-c.md") {
                return "---\nposition: 2\n---\n# Page C";
            }
            return "---\n---\n# Content";
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir,
            readFileFn: mockReadFile
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({ type: "section", title: "Section B" });
        expect(result[1]).toMatchObject({ type: "page", title: "Page C" });
        expect(result[2]).toMatchObject({ type: "page", title: "Page A" });
    });

    it("should not use position from index file if no index file exists", async () => {
        let callCount = 0;
        const mockGetDir = async (path: AbsoluteFilePath) => {
            callCount++;
            if (callCount === 1) {
                return [
                    {
                        type: "directory" as const,
                        name: "zebra-section",
                        absolutePath: "/test/zebra-section" as AbsoluteFilePath,
                        contents: []
                    },
                    {
                        type: "directory" as const,
                        name: "alpha-section",
                        absolutePath: "/test/alpha-section" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (path === ("/test/zebra-section" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/zebra-section/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else if (path === ("/test/alpha-section" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/alpha-section/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            } else {
                return [];
            }
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: "section", title: "Alpha Section" });
        expect(result[1]).toMatchObject({ type: "section", title: "Zebra Section" });
    });
});

describe("buildNavigationForDirectory with underscore prefix exclusion", () => {
    it("should exclude files starting with _ from navigation", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "getting-started.md",
                absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "_draft-page.md",
                absolutePath: "/test/_draft-page.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "_hidden.mdx",
                absolutePath: "/test/_hidden.mdx" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: "page",
            title: "Getting Started",
            slug: "getting-started"
        });
    });

    it("should exclude directories starting with _ from navigation", async () => {
        const mockGetDir = async (path: AbsoluteFilePath) => {
            if (path === ("/test" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "getting-started.md",
                        absolutePath: "/test/getting-started.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "directory" as const,
                        name: "_drafts",
                        absolutePath: "/test/_drafts" as AbsoluteFilePath,
                        contents: []
                    },
                    {
                        type: "directory" as const,
                        name: "guides",
                        absolutePath: "/test/guides" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (path === ("/test/guides" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "intro.md",
                        absolutePath: "/test/guides/intro.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            }
            return [];
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: "page", title: "Getting Started" });
        expect(result[1]).toMatchObject({ type: "section", title: "Guides" });
        // _drafts directory should not appear
        const titles = result.map((item) =>
            item.type === "section" ? item.title : item.type === "page" ? item.title : ""
        );
        expect(titles).not.toContain("Drafts");
    });

    it("should exclude both underscore files and directories together", async () => {
        const mockGetDir = async (path: AbsoluteFilePath) => {
            if (path === ("/test" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "visible.md",
                        absolutePath: "/test/visible.md" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "file" as const,
                        name: "_hidden-file.mdx",
                        absolutePath: "/test/_hidden-file.mdx" as AbsoluteFilePath,
                        contents: ""
                    },
                    {
                        type: "directory" as const,
                        name: "_hidden-folder",
                        absolutePath: "/test/_hidden-folder" as AbsoluteFilePath,
                        contents: []
                    },
                    {
                        type: "directory" as const,
                        name: "visible-folder",
                        absolutePath: "/test/visible-folder" as AbsoluteFilePath,
                        contents: []
                    }
                ];
            } else if (path === ("/test/visible-folder" as AbsoluteFilePath)) {
                return [
                    {
                        type: "file" as const,
                        name: "page.md",
                        absolutePath: "/test/visible-folder/page.md" as AbsoluteFilePath,
                        contents: ""
                    }
                ];
            }
            return [];
        };

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: "page", title: "Visible" });
        expect(result[1]).toMatchObject({ type: "section", title: "Visible Folder" });
    });

    it("should not exclude files where underscore is not the first character", async () => {
        const mockGetDir = async () => [
            {
                type: "file" as const,
                name: "my_page.md",
                absolutePath: "/test/my_page.md" as AbsoluteFilePath,
                contents: ""
            },
            {
                type: "file" as const,
                name: "another-page_v2.mdx",
                absolutePath: "/test/another-page_v2.mdx" as AbsoluteFilePath,
                contents: ""
            }
        ];

        const result = await buildNavigationForDirectory({
            directoryPath: "/test" as AbsoluteFilePath,
            getDir: mockGetDir
        });

        expect(result).toHaveLength(2);
    });
});
