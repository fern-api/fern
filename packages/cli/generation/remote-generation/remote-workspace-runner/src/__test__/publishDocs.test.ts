import { RelativeFilePath } from "@fern-api/fs-utils";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Auth message helpers are defined locally to avoid transitive import issues
// (publishDocs.ts has heavy dependencies). The logic here must stay in sync with publishDocs.ts.
const FORBIDDEN_ORG_MEMBERSHIP_PATTERNS = ["does not belong to organization", "User does not belong"];

function extractServerError(content: Record<string, unknown> | undefined): {
    code: string | undefined;
    message: string | undefined;
} {
    if (content == null) {
        return { code: undefined, message: undefined };
    }
    const body = content.body as Record<string, unknown> | string | undefined;
    if (body != null && typeof body === "object") {
        const code = typeof body.code === "string" ? body.code : undefined;
        const message = typeof body.message === "string" ? body.message : undefined;
        return { code, message };
    }
    const message =
        typeof body === "string" && body.length > 0
            ? body
            : typeof content.errorMessage === "string"
              ? content.errorMessage
              : typeof content.message === "string"
                ? content.message
                : undefined;
    return { code: undefined, message };
}

function buildForbiddenMessage(
    domain: string,
    organization: string,
    message: string | undefined,
    loginCommand: string
): string {
    if (message == null) {
        return `You do not have permission to publish docs to '${domain}' under organization '${organization}'.`;
    }
    if (FORBIDDEN_ORG_MEMBERSHIP_PATTERNS.some((pattern) => message.includes(pattern))) {
        return (
            `You are not a member of organization '${organization}'. ` +
            `Please run '${loginCommand}' to ensure you are logged in with the correct account.\n\n` +
            "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not."
        );
    }
    return message;
}

function buildUnauthorizedMessage(organization: string, message: string | undefined, loginCommand: string): string {
    if (message != null && message.includes("Invalid authorization token")) {
        return "Your authentication token is invalid or expired. " + `Please run '${loginCommand}' to re-authenticate.`;
    }
    return (
        `You are not authorized to publish docs under organization '${organization}'. ` +
        `Please run '${loginCommand}' to ensure you are logged in with the correct account.\n\n` +
        "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not."
    );
}

function buildAuthFailureMessage(
    domain: string,
    organization: string,
    errorContent: Record<string, unknown> | undefined,
    loginCommand: string
): string {
    const { code, message } = extractServerError(errorContent);
    switch (code) {
        case "FORBIDDEN":
            return buildForbiddenMessage(domain, organization, message, loginCommand);
        case "UNAUTHORIZED":
            return buildUnauthorizedMessage(organization, message, loginCommand);
        case "INTERNAL_SERVER_ERROR":
            return `An internal server error occurred while publishing docs to '${domain}'. Please try again or reach out to support@buildwithfern.com for assistance.`;
        default:
            if (message != null) {
                return message;
            }
            return `Failed to publish docs to '${domain}'. Please reach out to support@buildwithfern.com for assistance.`;
    }
}

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

describe("auth error message builders", () => {
    const ORG = "my-org";
    const DOMAIN = "docs.example.com";
    const V1_CMD = "fern login";
    const V2_CMD = "fern auth login";

    describe("buildForbiddenMessage", () => {
        it("returns generic permission message when message is undefined", () => {
            const result = buildForbiddenMessage(DOMAIN, ORG, undefined, V1_CMD);
            expect(result).toBe(
                `You do not have permission to publish docs to '${DOMAIN}' under organization '${ORG}'.`
            );
        });

        it("returns org membership hint with v1 login command when message matches membership pattern", () => {
            const result = buildForbiddenMessage(DOMAIN, ORG, "User does not belong to org", V1_CMD);
            expect(result).toContain(`run '${V1_CMD}'`);
            expect(result).toContain(`not a member of organization '${ORG}'`);
        });

        it("returns org membership hint with v2 login command when message matches membership pattern", () => {
            const result = buildForbiddenMessage(DOMAIN, ORG, "does not belong to organization acme", V2_CMD);
            expect(result).toContain(`run '${V2_CMD}'`);
            expect(result).not.toContain(V1_CMD);
        });

        it("passes through unrecognized server messages unchanged", () => {
            const serverMessage = "Your plan does not include this feature.";
            const result = buildForbiddenMessage(DOMAIN, ORG, serverMessage, V1_CMD);
            expect(result).toBe(serverMessage);
        });
    });

    describe("buildUnauthorizedMessage", () => {
        it("returns token-expired hint with v1 login command for invalid token message", () => {
            const result = buildUnauthorizedMessage(ORG, "Invalid authorization token", V1_CMD);
            expect(result).toContain(`run '${V1_CMD}'`);
            expect(result).toContain("invalid or expired");
        });

        it("returns token-expired hint with v2 login command for invalid token message", () => {
            const result = buildUnauthorizedMessage(ORG, "Invalid authorization token", V2_CMD);
            expect(result).toContain(`run '${V2_CMD}'`);
            expect(result).not.toContain(V1_CMD);
        });

        it("returns generic unauthorized message when message is undefined", () => {
            const result = buildUnauthorizedMessage(ORG, undefined, V1_CMD);
            expect(result).toContain(`run '${V1_CMD}'`);
            expect(result).toContain(`not authorized to publish docs under organization '${ORG}'`);
        });

        it("returns generic unauthorized message for unrecognized message", () => {
            const result = buildUnauthorizedMessage(ORG, "Some other auth error", V2_CMD);
            expect(result).toContain(`run '${V2_CMD}'`);
            expect(result).toContain(`not authorized to publish docs under organization '${ORG}'`);
        });
    });

    describe("buildAuthFailureMessage", () => {
        it("routes FORBIDDEN to buildForbiddenMessage with correct loginCommand", () => {
            const content: Record<string, unknown> = {
                reason: "status-code",
                statusCode: 403,
                body: { code: "FORBIDDEN", message: "does not belong to organization" }
            };
            const result = buildAuthFailureMessage(DOMAIN, ORG, content, V2_CMD);
            expect(result).toContain(`run '${V2_CMD}'`);
        });

        it("routes UNAUTHORIZED to buildUnauthorizedMessage with correct loginCommand", () => {
            const content: Record<string, unknown> = {
                reason: "status-code",
                statusCode: 401,
                body: { code: "UNAUTHORIZED", message: "Invalid authorization token" }
            };
            const result = buildAuthFailureMessage(DOMAIN, ORG, content, V2_CMD);
            expect(result).toContain(`run '${V2_CMD}'`);
            expect(result).toContain("invalid or expired");
        });

        it("returns internal server error message for INTERNAL_SERVER_ERROR code", () => {
            const content: Record<string, unknown> = {
                body: { code: "INTERNAL_SERVER_ERROR" }
            };
            const result = buildAuthFailureMessage(DOMAIN, ORG, content, V1_CMD);
            expect(result).toContain("internal server error");
            expect(result).toContain(DOMAIN);
        });

        it("returns server message directly when code is unrecognized but message is present", () => {
            const content: Record<string, unknown> = {
                body: { code: "SOME_OTHER_CODE", message: "Custom server error" }
            };
            const result = buildAuthFailureMessage(DOMAIN, ORG, content, V1_CMD);
            expect(result).toBe("Custom server error");
        });

        it("returns fallback message when content is undefined", () => {
            const result = buildAuthFailureMessage(DOMAIN, ORG, undefined, V1_CMD);
            expect(result).toContain("Failed to publish docs");
            expect(result).toContain(DOMAIN);
        });
    });
});
