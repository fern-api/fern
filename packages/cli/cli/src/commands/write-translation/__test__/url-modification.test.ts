import { describe, expect, it } from "vitest";
import { addLanguageSuffixToUrl } from "../writeTranslationForProject";

describe("addLanguageSuffixToUrl", () => {
    describe("buildwithfern.com domains", () => {
        it("should add language as org suffix for buildwithfern.com domains", () => {
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com", "de")).toBe(
                "https://acme-de.docs.buildwithfern.com/de"
            );
            expect(addLanguageSuffixToUrl("https://company.docs.buildwithfern.com/api/v1", "fr")).toBe(
                "https://company-fr.docs.buildwithfern.com/fr/api/v1"
            );
            expect(addLanguageSuffixToUrl("https://test.docs.buildwithfern.com/docs/getting-started", "es")).toBe(
                "https://test-es.docs.buildwithfern.com/es/docs/getting-started"
            );
        });

        it("should handle buildwithfern.com URLs with query parameters and fragments", () => {
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com/docs?version=v1", "de")).toBe(
                "https://acme-de.docs.buildwithfern.com/de/docs?version=v1"
            );
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com/docs#section", "de")).toBe(
                "https://acme-de.docs.buildwithfern.com/de/docs#section"
            );
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com/docs?q=test#section", "de")).toBe(
                "https://acme-de.docs.buildwithfern.com/de/docs?q=test#section"
            );
        });

        it("should handle buildwithfern.com URLs with trailing slashes", () => {
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com/docs/", "de")).toBe(
                "https://acme-de.docs.buildwithfern.com/de/docs/"
            );
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com/api/v1/", "fr")).toBe(
                "https://acme-fr.docs.buildwithfern.com/fr/api/v1/"
            );
        });
    });

    describe("custom domains", () => {
        it("should add language as subdomain prefix for custom domains", () => {
            expect(addLanguageSuffixToUrl("https://docs.custom.com", "de")).toBe("https://de.docs.custom.com/de");
            expect(addLanguageSuffixToUrl("https://api.example.com/v1", "fr")).toBe("https://fr.api.example.com/fr/v1");
            expect(addLanguageSuffixToUrl("https://help.company.com/docs/getting-started", "es")).toBe(
                "https://es.help.company.com/es/docs/getting-started"
            );
        });

        it("should handle custom domain URLs with query parameters and fragments", () => {
            expect(addLanguageSuffixToUrl("https://docs.custom.com/docs?version=v1", "de")).toBe(
                "https://de.docs.custom.com/de/docs?version=v1"
            );
            expect(addLanguageSuffixToUrl("https://docs.custom.com/docs#section", "de")).toBe(
                "https://de.docs.custom.com/de/docs#section"
            );
            expect(addLanguageSuffixToUrl("https://docs.custom.com/docs?q=test#section", "de")).toBe(
                "https://de.docs.custom.com/de/docs?q=test#section"
            );
        });

        it("should handle custom domain URLs with trailing slashes", () => {
            expect(addLanguageSuffixToUrl("https://docs.custom.com/docs/", "de")).toBe(
                "https://de.docs.custom.com/de/docs/"
            );
            expect(addLanguageSuffixToUrl("https://api.example.com/v1/", "fr")).toBe(
                "https://fr.api.example.com/fr/v1/"
            );
        });
    });

    describe("different protocols", () => {
        it("should handle different protocols correctly for buildwithfern.com", () => {
            expect(addLanguageSuffixToUrl("http://acme.docs.buildwithfern.com/docs", "de")).toBe(
                "http://acme-de.docs.buildwithfern.com/de/docs"
            );
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com/docs", "de")).toBe(
                "https://acme-de.docs.buildwithfern.com/de/docs"
            );
        });

        it("should handle different protocols correctly for custom domains", () => {
            expect(addLanguageSuffixToUrl("http://docs.custom.com/api", "fr")).toBe("http://fr.docs.custom.com/fr/api");
            expect(addLanguageSuffixToUrl("https://docs.custom.com/api", "fr")).toBe(
                "https://fr.docs.custom.com/fr/api"
            );
        });
    });

    describe("edge cases and fallbacks", () => {
        it("should handle invalid URLs with fallback logic for buildwithfern.com", () => {
            expect(addLanguageSuffixToUrl("acme.docs.buildwithfern.com", "de")).toBe(
                "acme-de.docs.buildwithfern.com/de"
            );
            expect(addLanguageSuffixToUrl("test.docs.buildwithfern.com/path", "fr")).toBe(
                "test-fr.docs.buildwithfern.com/fr/path"
            );
        });

        it("should handle invalid URLs with fallback logic for custom domains", () => {
            expect(addLanguageSuffixToUrl("docs.custom.com", "de")).toBe("de.docs.custom.com/de");
            expect(addLanguageSuffixToUrl("api.example.com/path", "de")).toBe("de.api.example.com/de/path");
            expect(addLanguageSuffixToUrl("simple-string", "de")).toBe("de.simple-string/de");
        });
    });

    describe("real-world examples", () => {
        it("should handle common documentation URL patterns", () => {
            // buildwithfern.com examples
            expect(addLanguageSuffixToUrl("https://docs.docs.buildwithfern.com", "de")).toBe(
                "https://docs-de.docs.buildwithfern.com/de"
            );
            expect(addLanguageSuffixToUrl("https://acme.docs.buildwithfern.com/overview", "de")).toBe(
                "https://acme-de.docs.buildwithfern.com/overview/de"
            );

            // Custom domain examples
            expect(addLanguageSuffixToUrl("https://api.example.com/docs", "fr")).toBe(
                "https://fr.api.example.com/docs/fr"
            );
            expect(addLanguageSuffixToUrl("https://company.github.io/docs/", "es")).toBe(
                "https://es.company.github.io/es/docs/"
            );
        });
    });
});
