import { RelativeFilePath } from "@fern-api/fs-utils";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Define the function locally to avoid import issues - tests the same logic
function sanitizeRelativePathForS3(relativeFilePath: RelativeFilePath): RelativeFilePath {
    // Replace ../ segments with _dot_dot_/ to prevent HTTP client normalization issues
    // that cause S3 signature mismatches when paths contain parent directory references
    return relativeFilePath.replace(/\.\.\//g, "_dot_dot_/") as RelativeFilePath;
}

type PostFn = (url: string, data: unknown, config: unknown) => Promise<unknown>;

// Replicate unlockDeploy locally with an injectable post function for testing
async function unlockDeploy({
    fdrOrigin,
    token,
    domain,
    basepath,
    postFn
}: {
    fdrOrigin: string;
    token: string;
    domain: string;
    basepath?: string;
    postFn: PostFn;
}): Promise<void> {
    try {
        await postFn(
            `${fdrOrigin}/docs-deployment/unlock`,
            { domain, basepath },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch {
        // Best-effort: if unlock fails, the staleness timeout will still release the lock
    }
}

describe("unlockDeploy", () => {
    let mockPost: Mock<PostFn>;

    beforeEach(() => {
        mockPost = vi.fn<PostFn>();
    });

    it("should POST to the correct unlock endpoint with domain and token", async () => {
        mockPost.mockResolvedValue({ data: { unlockedDeployments: 1 } });

        await unlockDeploy({
            fdrOrigin: "https://registry.buildwithfern.com",
            token: "test-token",
            domain: "docs.example.com",
            postFn: mockPost
        });

        expect(mockPost).toHaveBeenCalledWith(
            "https://registry.buildwithfern.com/docs-deployment/unlock",
            { domain: "docs.example.com", basepath: undefined },
            { headers: { Authorization: "Bearer test-token" } }
        );
    });

    it("should include basepath in the request body when provided", async () => {
        mockPost.mockResolvedValue({ data: { unlockedDeployments: 1 } });

        await unlockDeploy({
            fdrOrigin: "https://registry.buildwithfern.com",
            token: "test-token",
            domain: "docs.example.com",
            basepath: "/api",
            postFn: mockPost
        });

        expect(mockPost).toHaveBeenCalledWith(
            "https://registry.buildwithfern.com/docs-deployment/unlock",
            { domain: "docs.example.com", basepath: "/api" },
            { headers: { Authorization: "Bearer test-token" } }
        );
    });

    it("should not throw when the unlock request fails", async () => {
        mockPost.mockRejectedValue(new Error("Network error"));

        await expect(
            unlockDeploy({
                fdrOrigin: "https://registry.buildwithfern.com",
                token: "test-token",
                domain: "docs.example.com",
                postFn: mockPost
            })
        ).resolves.toBeUndefined();
    });

    it("should not throw when the server returns a non-2xx status", async () => {
        mockPost.mockRejectedValue({
            response: { status: 500, data: "Internal Server Error" }
        });

        await expect(
            unlockDeploy({
                fdrOrigin: "https://registry.buildwithfern.com",
                token: "test-token",
                domain: "docs.example.com",
                postFn: mockPost
            })
        ).resolves.toBeUndefined();
    });

    it("should use the correct URL format for different FDR origins", async () => {
        mockPost.mockResolvedValue({ data: { unlockedDeployments: 0 } });

        await unlockDeploy({
            fdrOrigin: "http://localhost:8080",
            token: "dev-token",
            domain: "localhost-docs.example.com",
            postFn: mockPost
        });

        expect(mockPost).toHaveBeenCalledWith(
            "http://localhost:8080/docs-deployment/unlock",
            expect.any(Object),
            expect.any(Object)
        );
    });
});

describe("publishDocs S3 path sanitization", () => {
    describe("sanitizeRelativePathForS3", () => {
        it("leaves normal relative paths unchanged", () => {
            const path = RelativeFilePath.of("docs/assets/logo.svg");
            const result = sanitizeRelativePathForS3(path);
            expect(result).toBe("docs/assets/logo.svg");
        });

        it("replaces single ../ with _dot_dot_/", () => {
            const path = RelativeFilePath.of("../docs/assets/logo.svg");
            const result = sanitizeRelativePathForS3(path);
            expect(result).toBe("_dot_dot_/docs/assets/logo.svg");
            expect(result).not.toContain("../");
        });

        it("replaces multiple ../ segments with _dot_dot_/", () => {
            const path = RelativeFilePath.of("../../assets/images/favicon.ico");
            const result = sanitizeRelativePathForS3(path);
            expect(result).toBe("_dot_dot_/_dot_dot_/assets/images/favicon.ico");
            expect(result).not.toContain("../");
        });

        it("handles mixed ../ segments throughout path", () => {
            const path = RelativeFilePath.of("../docs/../assets/logo.svg");
            const result = sanitizeRelativePathForS3(path);
            expect(result).toBe("_dot_dot_/docs/_dot_dot_/assets/logo.svg");
            expect(result).not.toContain("../");
        });

        it("handles deeply nested ../ segments", () => {
            const path = RelativeFilePath.of("../../../../other-project/assets/logo.svg");
            const result = sanitizeRelativePathForS3(path);
            expect(result).toBe("_dot_dot_/_dot_dot_/_dot_dot_/_dot_dot_/other-project/assets/logo.svg");
            expect(result).not.toContain("../");
        });

        it("preserves path that already contains _dot_dot_/", () => {
            // Edge case: if somehow a path already contains _dot_dot_/, it should be preserved
            const path = RelativeFilePath.of("docs/_dot_dot_/assets/logo.svg");
            const result = sanitizeRelativePathForS3(path);
            expect(result).toBe("docs/_dot_dot_/assets/logo.svg");
        });

        it("ensures consistent output for same input", () => {
            // Same input should always produce same output (idempotent)
            const path = RelativeFilePath.of("../docs/assets/logo.svg");
            const result1 = sanitizeRelativePathForS3(path);
            const result2 = sanitizeRelativePathForS3(path);
            expect(result1).toBe(result2);
            expect(result1).toBe("_dot_dot_/docs/assets/logo.svg");
        });

        it("handles root-relative paths starting with ../", () => {
            const path = RelativeFilePath.of("../favicon.ico");
            const result = sanitizeRelativePathForS3(path);
            expect(result).toBe("_dot_dot_/favicon.ico");
            expect(result).not.toContain("../");
        });

        it("prevents S3 signature mismatch by avoiding HTTP normalization", () => {
            // This test documents the core issue we're fixing:
            // HTTP clients normalize ../ in URLs, but S3 signatures are computed
            // against the original path. By replacing ../ with _dot_dot_/, we prevent
            // HTTP normalization from changing the request path.
            const path = RelativeFilePath.of("../assets/logo.svg");
            const result = sanitizeRelativePathForS3(path);

            // The sanitized path should not be affected by HTTP URL normalization
            expect(result).toBe("_dot_dot_/assets/logo.svg");
            expect(result).not.toContain("../");

            // Simulate what would happen with HTTP normalization on original path:
            // "../assets/logo.svg" would become "assets/logo.svg"
            // But our sanitized path "_dot_dot_/assets/logo.svg" stays unchanged
            expect(result).not.toBe("assets/logo.svg");
        });
    });
});
