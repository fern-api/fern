import { describe, expect, it } from "vitest";

import { isPreviewUrl, PREVIEW_URL_PATTERN } from "../deleteDocsPreview";

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
});
