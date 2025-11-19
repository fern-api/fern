import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { buildNavigationForDirectory, getFrontmatterPosition, nameToSlug, nameToTitle } from "../navigationUtils";

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
        if (firstItem && firstItem.type === "section") {
            expect(firstItem.contents).toHaveLength(1);
            expect(firstItem.contents[0]).toMatchObject({
                type: "page",
                title: "Authentication",
                slug: "authentication"
            });
        }
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
        if (firstItem && firstItem.type === "section") {
            expect(firstItem.contents).toHaveLength(1);
            expect(firstItem.contents[0]).toMatchObject({
                type: "section",
                title: "Advanced",
                slug: "advanced"
            });
            const secondItem = firstItem.contents[0];
            if (secondItem && secondItem.type === "section") {
                expect(secondItem.contents).toHaveLength(1);
                expect(secondItem.contents[0]).toMatchObject({
                    type: "page",
                    title: "Authentication",
                    slug: "authentication"
                });
            }
        }
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
