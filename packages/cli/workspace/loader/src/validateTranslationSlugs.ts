/**
 * Locale codes the docs platform recognizes as routable URL prefixes.
 *
 * This list MUST stay in sync, one-to-one, with `LOCALE_LABELS` in fern-platform
 * (`packages/fern-docs/components/src/header/language-dropdown-utils.ts`) — that
 * is the exact set the docs middleware matches URL path prefixes against
 * (`KNOWN_LOCALES = Object.keys(LOCALE_LABELS)`).
 *
 * A translation `slug` override may NOT be one of these codes: the docs
 * middleware resolves a recognized locale code to its locale at the edge, before
 * any slug logic runs (it can't read the site config there). So a slug that
 * collides with a locale code could never take effect and would silently
 * mis-route. We reject such slugs at `fern check` / generation time instead.
 */
const RECOGNIZED_LOCALE_CODES: readonly string[] = [
    "en",
    "en-US",
    "en-GB",
    "en-AU",
    "en-CA",
    "en-IE",
    "en-IN",
    "en-NZ",
    "fr",
    "fr-FR",
    "fr-CA",
    "fr-BE",
    "fr-CH",
    "de",
    "de-DE",
    "de-AT",
    "de-CH",
    "it",
    "it-IT",
    "it-CH",
    "ja",
    "ja-JP",
    "es",
    "es-ES",
    "es-MX",
    "es-AR",
    "es-CL",
    "es-CO",
    "es-419",
    "ko",
    "ko-KR",
    "zh",
    "zh-CN",
    "zh-TW",
    "zh-HK",
    "zh-SG",
    "zh-Hans",
    "zh-Hant",
    "ru",
    "ru-RU",
    "pt",
    "pt-PT",
    "pt-BR",
    "nl",
    "nl-NL",
    "nl-BE",
    "el",
    "el-GR",
    "no",
    "nb",
    "nn",
    "nb-NO",
    "nn-NO",
    "pl",
    "pl-PL",
    "sv",
    "sv-SE",
    "tr",
    "tr-TR",
    "id",
    "id-ID",
    "da",
    "da-DK",
    "fi",
    "fi-FI",
    "cs",
    "cs-CZ",
    "sk",
    "sk-SK",
    "hu",
    "hu-HU",
    "ro",
    "ro-RO",
    "bg",
    "bg-BG",
    "hr",
    "hr-HR",
    "sr",
    "sr-RS",
    "sl",
    "sl-SI",
    "uk",
    "uk-UA",
    "ca",
    "ca-ES",
    "he",
    "he-IL",
    "ar",
    "ar-SA",
    "ar-EG",
    "ar-AE",
    "ar-MA",
    "fa",
    "fa-IR",
    "ur",
    "ur-PK",
    "hi",
    "hi-IN",
    "bn",
    "bn-BD",
    "bn-IN",
    "th",
    "th-TH",
    "vi",
    "vi-VN",
    "ms",
    "ms-MY"
];

/**
 * Locale prefix matching in the docs middleware is case-insensitive, so the
 * reserved set is compared case-insensitively too.
 */
const RECOGNIZED_LOCALE_CODES_LOWER: ReadonlySet<string> = new Set(RECOGNIZED_LOCALE_CODES.map((c) => c.toLowerCase()));

/** A `translations` entry as it appears in the raw docs.yml (string or object). */
export type RawTranslationEntry = string | { lang: string; slug?: string | null; default?: boolean | null };

function normalizeEntry(entry: RawTranslationEntry): { lang: string; slug: string | undefined } {
    if (typeof entry === "string") {
        return { lang: entry, slug: undefined };
    }
    return { lang: entry.lang, slug: entry.slug ?? undefined };
}

/**
 * Validates the `slug` overrides on `translations`. Returns a list of
 * human-readable error messages (empty when valid).
 *
 * A slug is rejected when it:
 *  1. is a recognized locale code (would be intercepted by middleware as that
 *     locale before the slug can take effect),
 *  2. equals another translation's locale (`lang`) configured on the same site,
 *  3. duplicates another translation's slug.
 *
 * A slug equal to its own locale (case-insensitively) is a harmless no-op and is
 * ignored.
 */
export function validateTranslationSlugs(translations: readonly RawTranslationEntry[] | undefined): string[] {
    if (translations == null || translations.length === 0) {
        return [];
    }

    const normalized = translations.map(normalizeEntry);
    const configuredLangs = new Set(normalized.map((t) => t.lang.toLowerCase()));
    const slugOwnerByLower = new Map<string, string>();
    const errors: string[] = [];

    for (const { lang, slug } of normalized) {
        if (slug == null || slug.toLowerCase() === lang.toLowerCase()) {
            continue;
        }
        const slugLower = slug.toLowerCase();

        if (RECOGNIZED_LOCALE_CODES_LOWER.has(slugLower)) {
            errors.push(
                `translations: slug "${slug}" (for locale "${lang}") is a reserved locale code and cannot be used as a URL slug. ` +
                    `Choose a non-locale slug, e.g. a market/region code like "jp".`
            );
            continue;
        }
        if (configuredLangs.has(slugLower)) {
            errors.push(
                `translations: slug "${slug}" (for locale "${lang}") conflicts with another locale ("${slug}") configured on this site. ` +
                    `A slug cannot equal another locale's code.`
            );
            continue;
        }
        const existingOwner = slugOwnerByLower.get(slugLower);
        if (existingOwner != null) {
            errors.push(
                `translations: slug "${slug}" is used by more than one locale ("${existingOwner}" and "${lang}"). ` +
                    `Each slug must be unique.`
            );
            continue;
        }
        slugOwnerByLower.set(slugLower, lang);
    }

    return errors;
}
