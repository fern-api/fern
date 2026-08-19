import { describe, expect, it } from "vitest";

import { buildPreviewDomain, isPreviewUrl, PREVIEW_URL_PATTERN, sanitizePreviewId } from "../previewUrlUtils.js";

describe("Preview URL Validation", () => {
    describe("PREVIEW_URL_PATTERN regex", () => {
        it("should match simple alphanumeric hash", () => {
            expect(PREVIEW_URL_PATTERN.test("acme-preview-abc123.docs.buildwithfern.com")).toBe(true);
        });

        it("should match UUID-style hash with hyphens", () => {
            expect(
                PREVIEW_URL_PATTERN.test(
                    "audiences-api-preview-9b2b47f0-c44b-4338-b579-46872f33404a.docs.buildwithfern.com"
                )
            ).toBe(true);
        });

        it("should match org name with hyphens", () => {
            expect(PREVIEW_URL_PATTERN.test("my-company-api-preview-abc123.docs.buildwithfern.com")).toBe(true);
        });

        it("should be case insensitive", () => {
            expect(PREVIEW_URL_PATTERN.test("ACME-PREVIEW-ABC123.DOCS.BUILDWITHFERN.COM")).toBe(true);
            expect(PREVIEW_URL_PATTERN.test("Acme-Preview-Abc123.Docs.BuildWithFern.Com")).toBe(true);
        });

        it("should not match non-preview URLs", () => {
            expect(PREVIEW_URL_PATTERN.test("acme.docs.buildwithfern.com")).toBe(false);
        });

        it("should not match URLs without the correct domain", () => {
            expect(PREVIEW_URL_PATTERN.test("acme-preview-abc123.example.com")).toBe(false);
        });

        it("should not match URLs with extra subdomains", () => {
            expect(PREVIEW_URL_PATTERN.test("sub.acme-preview-abc123.docs.buildwithfern.com")).toBe(false);
        });
    });

    describe("isPreviewUrl function", () => {
        describe("valid preview URLs", () => {
            it("should accept simple preview URL", () => {
                expect(isPreviewUrl("acme-preview-abc123.docs.buildwithfern.com")).toBe(true);
            });

            it("should accept UUID-style hash preview URL", () => {
                expect(
                    isPreviewUrl("audiences-api-preview-9b2b47f0-c44b-4338-b579-46872f33404a.docs.buildwithfern.com")
                ).toBe(true);
            });

            it("should accept URL with https protocol", () => {
                expect(isPreviewUrl("https://acme-preview-abc123.docs.buildwithfern.com")).toBe(true);
            });

            it("should accept URL with http protocol", () => {
                expect(isPreviewUrl("http://acme-preview-abc123.docs.buildwithfern.com")).toBe(true);
            });

            it("should accept URL with path", () => {
                expect(isPreviewUrl("acme-preview-abc123.docs.buildwithfern.com/welcome")).toBe(true);
            });

            it("should accept URL with protocol and path", () => {
                expect(isPreviewUrl("https://acme-preview-abc123.docs.buildwithfern.com/api/reference")).toBe(true);
            });

            it("should handle whitespace", () => {
                expect(isPreviewUrl("  acme-preview-abc123.docs.buildwithfern.com  ")).toBe(true);
            });

            it("should handle mixed case", () => {
                expect(isPreviewUrl("ACME-PREVIEW-ABC123.DOCS.BUILDWITHFERN.COM")).toBe(true);
            });

            it("should accept real-world UUID preview URL with path", () => {
                expect(
                    isPreviewUrl(
                        "https://audiences-api-preview-9b2b47f0-c44b-4338-b579-46872f33404a.docs.buildwithfern.com/welcome"
                    )
                ).toBe(true);
            });
        });

        describe("invalid preview URLs", () => {
            it("should reject non-preview URL", () => {
                expect(isPreviewUrl("acme.docs.buildwithfern.com")).toBe(false);
            });

            it("should reject URL without preview marker", () => {
                expect(isPreviewUrl("acme-abc123.docs.buildwithfern.com")).toBe(false);
            });

            it("should reject URL with wrong domain", () => {
                expect(isPreviewUrl("acme-preview-abc123.example.com")).toBe(false);
            });

            it("should reject empty string", () => {
                expect(isPreviewUrl("")).toBe(false);
            });

            it("should reject URL with only whitespace", () => {
                expect(isPreviewUrl("   ")).toBe(false);
            });
        });
    });

    describe("target auto-detection via isPreviewUrl", () => {
        it("should detect a bare preview URL as a URL target", () => {
            expect(isPreviewUrl("acme-preview-abc123.docs.buildwithfern.com")).toBe(true);
        });

        it("should detect a simple ID string as not a URL", () => {
            expect(isPreviewUrl("my-feature")).toBe(false);
        });

        it("should detect a UUID-like ID as not a URL", () => {
            expect(isPreviewUrl("9b2b47f0-c44b-4338-b579-46872f33404a")).toBe(false);
        });

        it("should detect an https preview URL as a URL target", () => {
            expect(isPreviewUrl("https://acme-preview-feat.docs.buildwithfern.com")).toBe(true);
        });

        it("should detect a plain word as an ID target", () => {
            expect(isPreviewUrl("staging")).toBe(false);
        });

        it("should detect a slug with hyphens as an ID target", () => {
            expect(isPreviewUrl("my-cool-feature-branch")).toBe(false);
        });
    });
});

describe("sanitizePreviewId", () => {
    it("should lowercase the ID", () => {
        expect(sanitizePreviewId("My-Feature")).toBe("my-feature");
    });

    it("should replace non-alphanumeric characters with hyphens", () => {
        expect(sanitizePreviewId("feat/my_feature!")).toBe("feat-my-feature");
    });

    it("should collapse consecutive hyphens", () => {
        expect(sanitizePreviewId("a---b")).toBe("a-b");
    });

    it("should strip leading and trailing hyphens", () => {
        expect(sanitizePreviewId("-hello-world-")).toBe("hello-world");
    });

    it("should return 'default' for empty string", () => {
        expect(sanitizePreviewId("")).toBe("default");
    });

    it("should return 'default' for string of only special characters", () => {
        expect(sanitizePreviewId("!!!")).toBe("default");
    });

    it("should handle already-clean IDs", () => {
        expect(sanitizePreviewId("my-feature-123")).toBe("my-feature-123");
    });

    it("should handle uppercase with special chars", () => {
        expect(sanitizePreviewId("Feature/BRANCH_Name")).toBe("feature-branch-name");
    });
});

describe("buildPreviewDomain", () => {
    it("should build a simple preview domain", () => {
        expect(buildPreviewDomain({ orgId: "acme", previewId: "my-feature" })).toBe(
            "acme-preview-my-feature.docs.buildwithfern.com"
        );
    });

    it("should sanitize the preview ID", () => {
        expect(buildPreviewDomain({ orgId: "acme", previewId: "My Feature!" })).toBe(
            "acme-preview-my-feature.docs.buildwithfern.com"
        );
    });

    it("should truncate long preview IDs when full domain exceeds limit", () => {
        const longId = "a".repeat(100);
        const result = buildPreviewDomain({ orgId: "acme", previewId: longId });
        expect(result).toMatch(/^acme-preview-a+\.docs\.buildwithfern\.com$/);
        // Subdomain label must not exceed the 62-char application cap
        const subdomain = result.split(".")[0] ?? "";
        expect(subdomain.length).toBeLessThanOrEqual(62);
        // Shorter IDs that fit within the limit are returned unchanged
        const shortResult = buildPreviewDomain({ orgId: "acme", previewId: "abc" });
        expect(shortResult).toBe("acme-preview-abc.docs.buildwithfern.com");
    });

    it("should throw for an org name that is too long", () => {
        const longOrg = "a".repeat(50);
        expect(() => buildPreviewDomain({ orgId: longOrg, previewId: "test" })).toThrow(
            /too long to generate a valid preview URL/
        );
    });

    it("should use 'default' for empty preview ID", () => {
        expect(buildPreviewDomain({ orgId: "acme", previewId: "" })).toBe(
            "acme-preview-default.docs.buildwithfern.com"
        );
    });

    it("should not truncate when domain fits within limit", () => {
        expect(buildPreviewDomain({ orgId: "acme", previewId: "abc" })).toBe("acme-preview-abc.docs.buildwithfern.com");
    });

    it("should strip trailing hyphens after truncation", () => {
        const id = "a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z";
        const result = buildPreviewDomain({ orgId: "acme", previewId: id });
        expect(result).not.toMatch(/-\.docs\.buildwithfern\.com$/);
    });
});
