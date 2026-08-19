// "global" — the theme value always wins; local docs.yml cannot override it.
// "local"  — the local docs.yml value wins when present; theme is the fallback.
export type ThemeFieldPolicy = "global" | "local";

// Controls, per eligible key, whether the global theme takes precedence or the
// local docs.yml can override. Add new theme-eligible keys here.
// Keys use the camelCase form that DocsConfiguration uses internally.
export const THEME_FIELD_POLICIES = {
    logo: "global",
    favicon: "global",
    backgroundImage: "global",
    colors: "global",
    typography: "global",
    layout: "global",
    settings: "global",
    theme: "global",
    integrations: "global",
    css: "global",
    js: "global",
    header: "global",
    footer: "global",
    navbarLinks: "global",
    footerLinks: "global",
    aiSearch: "global",
    announcement: "global",
    metadata: "global"
} as const satisfies Record<string, ThemeFieldPolicy>;

export type ThemeEligibleField = keyof typeof THEME_FIELD_POLICIES;

export const THEME_ELIGIBLE_FIELDS = Object.keys(THEME_FIELD_POLICIES) as ThemeEligibleField[];

function camelToKebab(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Kebab-case top-level keys as they appear in raw docs.yml / theme.yml. */
export const THEME_ELIGIBLE_YAML_KEYS = new Set(THEME_ELIGIBLE_FIELDS.map(camelToKebab));
