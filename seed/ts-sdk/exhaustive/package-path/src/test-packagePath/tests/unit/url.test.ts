import { joinUrl } from "../../../../src/test-packagePath/core/url.js";

describe("joinUrl", () => {
    describe("basic functionality", () => {
        it("should return empty string for empty base", () => {
            expect(joinUrl("")).toBe("");
            expect(joinUrl("", "path")).toBe("");
        });

        it("should handle single segment", () => {
            expect(joinUrl("base", "segment")).toBe("base/segment");
            expect(joinUrl("base/", "segment")).toBe("base/segment");
            expect(joinUrl("base", "/segment")).toBe("base/segment");
            expect(joinUrl("base/", "/segment")).toBe("base/segment");
        });

        it("should handle multiple segments", () => {
            expect(joinUrl("base", "path1", "path2", "path3")).toBe("base/path1/path2/path3");
            expect(joinUrl("base/", "/path1/", "/path2/", "/path3/")).toBe("base/path1/path2/path3");
        });
    });

    describe("URL handling", () => {
        it("should handle absolute URLs", () => {
            expect(joinUrl("https://example.com", "api", "v1")).toBe("https://example.com/api/v1");
            expect(joinUrl("https://example.com/", "/api/", "/v1/")).toBe("https://example.com/api/v1");
            expect(joinUrl("https://example.com/base", "api", "v1")).toBe("https://example.com/base/api/v1");
        });

        it("should preserve URL query parameters and fragments", () => {
            expect(joinUrl("https://example.com?query=1", "api")).toBe("https://example.com/api?query=1");
            expect(joinUrl("https://example.com#fragment", "api")).toBe("https://example.com/api#fragment");
            expect(joinUrl("https://example.com?query=1#fragment", "api")).toBe(
                "https://example.com/api?query=1#fragment",
            );
        });

        it("should handle different protocols", () => {
            expect(joinUrl("http://example.com", "api")).toBe("http://example.com/api");
            expect(joinUrl("ftp://example.com", "files")).toBe("ftp://example.com/files");
            expect(joinUrl("ws://example.com", "socket")).toBe("ws://example.com/socket");
        });

        it("should fallback to path joining for malformed URLs", () => {
            expect(joinUrl("not-a-url://", "path")).toBe("not-a-url:///path");
        });
    });

    describe("edge cases", () => {
        it("should handle empty segments", () => {
            expect(joinUrl("base", "", "path")).toBe("base/path");
            expect(joinUrl("base", null as any, "path")).toBe("base/path");
            expect(joinUrl("base", undefined as any, "path")).toBe("base/path");
        });

        it("should handle segments with only slashes", () => {
            expect(joinUrl("base", "/", "path")).toBe("base/path");
            expect(joinUrl("base", "//", "path")).toBe("base/path");
        });

        it("should handle base paths with trailing slashes", () => {
            expect(joinUrl("base/", "path")).toBe("base/path");
        });

        it("should handle complex nested paths", () => {
            expect(joinUrl("api/v1/", "/users/", "/123/", "/profile")).toBe("api/v1/users/123/profile");
        });
    });

    describe("real-world scenarios", () => {
        it("should handle API endpoint construction", () => {
            const baseUrl = "https://api.example.com/v1";
            expect(joinUrl(baseUrl, "users", "123", "posts")).toBe("https://api.example.com/v1/users/123/posts");
        });

        it("should handle file path construction", () => {
            expect(joinUrl("/var/www", "html", "assets", "images")).toBe("/var/www/html/assets/images");
        });

        it("should handle relative path construction", () => {
            expect(joinUrl("../parent", "child", "grandchild")).toBe("../parent/child/grandchild");
        });

        it("should handle Windows-style paths", () => {
            expect(joinUrl("C:\\Users", "Documents", "file.txt")).toBe("C:\\Users/Documents/file.txt");
        });
    });

    describe("performance scenarios", () => {
        it("should handle many segments efficiently", () => {
            const segments = Array(100).fill("segment");
            const result = joinUrl("base", ...segments);
            expect(result).toBe("base/" + segments.join("/"));
        });

        it("should handle long URLs", () => {
            const longPath = "a".repeat(1000);
            expect(joinUrl("https://example.com", longPath)).toBe(`https://example.com/${longPath}`);
        });
    });
});
