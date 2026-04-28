import { describe, expect, it } from "vitest";

import { DocsConfiguration, TranslationConfig } from "../DocsYmlSchemas.js";

describe("TranslationConfig schema", () => {
    it("should parse a translation entry with lang only", () => {
        const result = TranslationConfig.parse({ lang: "en" });
        expect(result.lang).toBe("en");
        expect(result.default).toBeUndefined();
    });

    it("should parse a translation entry with lang and default: true", () => {
        const result = TranslationConfig.parse({ lang: "fr", default: true });
        expect(result.lang).toBe("fr");
        expect(result.default).toBe(true);
    });

    it("should parse a translation entry with default: false", () => {
        const result = TranslationConfig.parse({ lang: "ja", default: false });
        expect(result.lang).toBe("ja");
        expect(result.default).toBe(false);
    });

    it("should accept BCP 47 locale tags with region subtags", () => {
        const locales = ["ja-JP", "pt-BR", "zh-Hans", "zh-Hans-CN", "en-US", "fr-CA"];
        for (const lang of locales) {
            const result = TranslationConfig.parse({ lang });
            expect(result.lang).toBe(lang);
        }
    });

    it("should reject an invalid language code", () => {
        expect(() => TranslationConfig.parse({ lang: "invalid locale with spaces" })).toThrow();
    });

    it("should reject a single-character code", () => {
        expect(() => TranslationConfig.parse({ lang: "x" })).toThrow();
    });

    it("should reject a missing lang field", () => {
        expect(() => TranslationConfig.parse({ default: true })).toThrow();
    });

    it("should reject a non-boolean default field", () => {
        expect(() => TranslationConfig.parse({ lang: "en", default: "yes" })).toThrow();
    });

    it("should accept all common language codes", () => {
        const langs = ["en", "es", "fr", "de", "it", "pt", "ja", "zh", "ko", "el", "no", "pl", "ru", "sv", "tr"];
        for (const lang of langs) {
            expect(() => TranslationConfig.parse({ lang })).not.toThrow();
        }
    });
});

describe("DocsConfiguration translations field", () => {
    it("should parse a docs config with no translations field", () => {
        const result = DocsConfiguration.parse({ instances: [] });
        expect(result.translations).toBeUndefined();
    });

    it("should parse a docs config with a single default translation", () => {
        const result = DocsConfiguration.parse({
            instances: [],
            translations: [{ lang: "en", default: true }]
        });
        expect(result.translations).toHaveLength(1);
        expect(result.translations?.[0]?.lang).toBe("en");
        expect(result.translations?.[0]?.default).toBe(true);
    });

    it("should parse a docs config with multiple translations", () => {
        const result = DocsConfiguration.parse({
            instances: [],
            translations: [{ lang: "en", default: true }, { lang: "ja" }, { lang: "fr" }]
        });
        expect(result.translations).toHaveLength(3);
        expect(result.translations?.[0]?.lang).toBe("en");
        expect(result.translations?.[1]?.lang).toBe("ja");
        expect(result.translations?.[1]?.default).toBeUndefined();
        expect(result.translations?.[2]?.lang).toBe("fr");
    });

    it("should accept translations with BCP 47 locale tags", () => {
        const result = DocsConfiguration.parse({
            instances: [],
            translations: [{ lang: "en", default: true }, { lang: "ja-JP" }, { lang: "pt-BR" }]
        });
        expect(result.translations).toHaveLength(3);
        expect(result.translations?.[1]?.lang).toBe("ja-JP");
        expect(result.translations?.[2]?.lang).toBe("pt-BR");
    });

    it("should reject translations with an invalid language code", () => {
        expect(() =>
            DocsConfiguration.parse({
                instances: [],
                translations: [{ lang: "invalid locale" }]
            })
        ).toThrow();
    });

    it("should allow translations alongside languages field", () => {
        const result = DocsConfiguration.parse({
            instances: [],
            languages: ["en", "fr"],
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });
        expect(result.languages).toEqual(["en", "fr"]);
        expect(result.translations).toHaveLength(2);
    });

    it("should accept BCP 47 locale tags in the languages field", () => {
        const result = DocsConfiguration.parse({
            instances: [],
            languages: ["en", "ja-JP", "zh-Hans-CN"]
        });
        expect(result.languages).toEqual(["en", "ja-JP", "zh-Hans-CN"]);
    });
});
