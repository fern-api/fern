import { describe, expect, it } from "vitest";
import { addLanguageSuffixToUrl } from "../writeTranslationForProject";

describe("addLanguageSuffixToUrl", () => {
    describe("valid URLs with paths", () => {
        it("should insert language at the beginning of existing paths", () => {
            expect(addLanguageSuffixToUrl("https://example.com/docs", "de")).toBe("https://example.com/de/docs");
            expect(addLanguageSuffixToUrl("https://example.com/api/v1", "fr")).toBe("https://example.com/fr/api/v1");
            expect(addLanguageSuffixToUrl("https://example.com/docs/getting-started", "es")).toBe(
                "https://example.com/es/docs/getting-started"
            );
        });

        it("should handle URLs with query parameters and fragments", () => {
            expect(addLanguageSuffixToUrl("https://example.com/docs?version=v1", "de")).toBe(
                "https://example.com/de/docs?version=v1"
            );
            expect(addLanguageSuffixToUrl("https://example.com/docs#section", "de")).toBe(
                "https://example.com/de/docs#section"
            );
            expect(addLanguageSuffixToUrl("https://example.com/docs?q=test#section", "de")).toBe(
                "https://example.com/de/docs?q=test#section"
            );
        });

        it("should handle URLs with trailing slashes", () => {
            expect(addLanguageSuffixToUrl("https://example.com/docs/", "de")).toBe("https://example.com/de/docs/");
            expect(addLanguageSuffixToUrl("https://example.com/api/v1/", "fr")).toBe("https://example.com/fr/api/v1/");
        });
    });

    describe("root URLs", () => {
        it("should handle root URLs correctly", () => {
            expect(addLanguageSuffixToUrl("https://example.com", "de")).toBe("https://example.com/de");
            expect(addLanguageSuffixToUrl("https://example.com/", "de")).toBe("https://example.com/de");
            expect(addLanguageSuffixToUrl("http://localhost:3000", "en")).toBe("http://localhost:3000/en");
            expect(addLanguageSuffixToUrl("http://localhost:3000/", "en")).toBe("http://localhost:3000/en");
        });
    });

    describe("different protocols", () => {
        it("should handle different protocols correctly", () => {
            expect(addLanguageSuffixToUrl("http://example.com/docs", "de")).toBe("http://example.com/de/docs");
            expect(addLanguageSuffixToUrl("https://example.com/docs", "de")).toBe("https://example.com/de/docs");
            expect(addLanguageSuffixToUrl("http://localhost:8080/api", "fr")).toBe("http://localhost:8080/fr/api");
        });
    });

    describe("edge cases and fallbacks", () => {
        it("should handle invalid URLs with fallback logic", () => {
            // These should use the fallback string manipulation
            expect(addLanguageSuffixToUrl("not-a-url/path", "de")).toBe("not-a-url/de/path");
            expect(addLanguageSuffixToUrl("example.com/docs", "de")).toBe("example.com/de/docs");
            expect(addLanguageSuffixToUrl("simple-string", "de")).toBe("simple-string/de");
        });
    });

    describe("real-world examples", () => {
        it("should handle common documentation URL patterns", () => {
            expect(addLanguageSuffixToUrl("https://docs.buildwithfern.com", "de")).toBe(
                "https://docs.buildwithfern.com/de"
            );
            expect(addLanguageSuffixToUrl("https://docs.buildwithfern.com/overview", "de")).toBe(
                "https://docs.buildwithfern.com/de/overview"
            );
            expect(addLanguageSuffixToUrl("https://api.example.com/docs", "fr")).toBe(
                "https://api.example.com/fr/docs"
            );
            expect(addLanguageSuffixToUrl("https://company.github.io/docs/", "es")).toBe(
                "https://company.github.io/es/docs/"
            );
        });
    });
});
