import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { buildNavigationForDirectory, nameToSlug, nameToTitle } from "../navigationUtils";

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
