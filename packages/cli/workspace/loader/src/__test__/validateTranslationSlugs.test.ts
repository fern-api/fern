import { type RawTranslationEntry, validateTranslationSlugs } from "../validateTranslationSlugs.js";

describe("validateTranslationSlugs", () => {
    describe("valid configurations", () => {
        it("accepts a market-code slug that is not a locale (jp for ja)", () => {
            expect(
                validateTranslationSlugs([{ lang: "en", default: true }, { lang: "fr" }, { lang: "ja", slug: "jp" }])
            ).toEqual([]);
        });

        it("accepts translations with no slugs", () => {
            expect(validateTranslationSlugs([{ lang: "en", default: true }, { lang: "ja" }, { lang: "fr" }])).toEqual(
                []
            );
        });

        it("accepts the string (shorthand) syntax", () => {
            expect(validateTranslationSlugs(["en", "ja", "fr"])).toEqual([]);
        });

        it("accepts undefined / empty translations", () => {
            expect(validateTranslationSlugs(undefined)).toEqual([]);
            expect(validateTranslationSlugs([])).toEqual([]);
        });

        it("ignores a slug that equals its own locale (case-insensitively)", () => {
            expect(validateTranslationSlugs([{ lang: "ja", slug: "ja" }])).toEqual([]);
            expect(validateTranslationSlugs([{ lang: "ja", slug: "JA" }])).toEqual([]);
        });

        it("accepts multiple distinct market-code slugs", () => {
            expect(
                validateTranslationSlugs([
                    { lang: "en", default: true },
                    { lang: "ja", slug: "jp" },
                    { lang: "ko", slug: "kr" }
                ])
            ).toEqual([]);
        });
    });

    describe("reserved locale code slugs are rejected", () => {
        it("rejects a slug equal to a recognized locale code (ja)", () => {
            const errors = validateTranslationSlugs([
                { lang: "en", default: true },
                { lang: "de", slug: "ja" }
            ]);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain('slug "ja"');
            expect(errors[0]).toContain("reserved locale code");
        });

        it("rejects reserved slugs case-insensitively (JA, EN, Fr)", () => {
            expect(validateTranslationSlugs([{ lang: "de", slug: "JA" }])).toHaveLength(1);
            expect(validateTranslationSlugs([{ lang: "de", slug: "EN" }])).toHaveLength(1);
            expect(validateTranslationSlugs([{ lang: "de", slug: "Fr" }])).toHaveLength(1);
        });

        it("rejects regional and script locale codes as slugs (pt-BR, zh-Hans)", () => {
            expect(validateTranslationSlugs([{ lang: "de", slug: "pt-BR" }])).toHaveLength(1);
            expect(validateTranslationSlugs([{ lang: "de", slug: "zh-Hans" }])).toHaveLength(1);
        });

        // The two edge cases the customer asked about.
        it("Scenario A: another locale borrowing `ja` while `ja` uses `jp`", () => {
            const errors = validateTranslationSlugs([
                { lang: "en", default: true },
                { lang: "ja", slug: "jp" },
                { lang: "ko", slug: "ja" }
            ]);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain('slug "ja"');
        });

        it("Scenario B: an unrelated locale borrowing `ja` with no Japanese configured", () => {
            const errors = validateTranslationSlugs([
                { lang: "en", default: true },
                { lang: "ko", slug: "ja" }
            ]);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain('slug "ja"');
        });
    });

    describe("collisions with configured locales are rejected", () => {
        it("rejects a slug equal to another configured (non-reserved) locale", () => {
            // `xh` (Xhosa) is a valid tag but not in the recognized set, so this
            // exercises the "collides with another configured locale" branch
            // rather than the reserved-code branch.
            const errors = validateTranslationSlugs([{ lang: "xh" }, { lang: "en", default: true, slug: "xh" }]);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain("conflicts with another locale");
        });
    });

    describe("duplicate slugs are rejected", () => {
        it("rejects two locales sharing the same slug", () => {
            const errors = validateTranslationSlugs([
                { lang: "ja", slug: "jp" },
                { lang: "ko", slug: "jp" }
            ]);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain("used by more than one locale");
        });

        it("treats duplicate slugs case-insensitively", () => {
            const errors = validateTranslationSlugs([
                { lang: "ja", slug: "jp" },
                { lang: "ko", slug: "JP" }
            ]);
            expect(errors).toHaveLength(1);
        });
    });

    it("reports every offending slug independently", () => {
        const errors = validateTranslationSlugs([
            { lang: "en", default: true },
            { lang: "de", slug: "ja" }, // reserved
            { lang: "ko", slug: "kr" }, // valid
            { lang: "it", slug: "kr" } // duplicate of ko's slug
        ] as RawTranslationEntry[]);
        expect(errors).toHaveLength(2);
    });
});
