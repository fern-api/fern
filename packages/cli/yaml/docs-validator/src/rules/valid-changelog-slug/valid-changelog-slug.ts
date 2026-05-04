import { docsYml } from "@fern-api/configuration-loader";
import { kebabCase } from "lodash-es";

import { validateProductConfigFileSchema } from "../../docsAst/validateProductConfig.js";
import { validateVersionConfigFileSchema } from "../../docsAst/validateVersionConfig.js";
import { Rule, RuleViolation } from "../../Rule.js";

/**
 * Allowlist of last-segment slug names that may serve a docs changelog feed
 * (RSS / Atom / JSON). The docs middleware only rewrites
 * `<slug>.{rss,atom,json}` to the changelog handler when the final segment of
 * `<slug>` matches one of these names — otherwise the request falls through
 * to a normal 404. This rule enforces the same list at `fern check` time so
 * customers never get a confusingly-empty feed.
 *
 * Keep this list in sync with `CHANGELOG_FEED_ALLOWED_SLUGS` in
 * `fern-api/fern-platform` (`packages/commons/docs-server/src/patterns.ts`).
 */
export const CHANGELOG_FEED_ALLOWED_SLUGS: readonly string[] = [
    "changelog",
    "changelogs",
    "release-notes",
    "releasenotes",
    "whats-new",
    "whatsnew"
];

const DEFAULT_CHANGELOG_TITLE = "Changelog";

/**
 * Computes the last URL segment of the slug at which a changelog feed will
 * be served. Mirrors the slug computation in
 * `packages/cli/docs-resolver/src/ChangelogNodeConverter.ts`:
 * the changelog node's own URL piece is `slug ?? kebabCase(title ?? "Changelog")`.
 *
 * If `slug` is set to a multi-segment value like `v2/release-notes`, only the
 * trailing segment matters because the feed URL is `<full-slug>.{rss,atom,json}`
 * and the middleware checks the segment immediately preceding the extension.
 */
export function getEffectiveChangelogSlugLastSegment(config: { slug?: string; title?: string }): string {
    const raw = config.slug ?? kebabCase(config.title ?? DEFAULT_CHANGELOG_TITLE);
    const segments = raw.split("/").filter((s) => s.length > 0);
    return segments[segments.length - 1] ?? "";
}

export function isAllowedChangelogSlug(lastSegment: string): boolean {
    return CHANGELOG_FEED_ALLOWED_SLUGS.includes(lastSegment);
}

interface ChangelogLocation {
    where: string;
    slug?: string;
    title?: string;
}

function collectChangelogLocations(
    items: docsYml.RawSchemas.NavigationItem[] | undefined,
    breadcrumb: string
): ChangelogLocation[] {
    if (items == null) {
        return [];
    }
    const out: ChangelogLocation[] = [];
    for (const item of items) {
        if (isChangelog(item)) {
            out.push({
                where: `${breadcrumb} > changelog (${item.changelog})`,
                slug: item.slug,
                title: item.title
            });
            continue;
        }
        if (isSection(item)) {
            const next = `${breadcrumb} > section "${item.section}"`;
            out.push(...collectChangelogLocations(item.contents, next));
        }
        // Folders have no nested navigation items in docs.yml today, so a
        // changelog cannot live inside one — no recursion needed.
    }
    return out;
}

function collectFromTabs(
    tabs: Record<string, docsYml.RawSchemas.TabConfig> | undefined,
    breadcrumb: string
): ChangelogLocation[] {
    if (tabs == null) {
        return [];
    }
    const out: ChangelogLocation[] = [];
    for (const [tabId, tab] of Object.entries(tabs)) {
        if (tab.changelog != null) {
            out.push({
                where: `${breadcrumb} > tab "${tabId}" (changelog: ${tab.changelog})`,
                slug: tab.slug,
                title: tab.displayName
            });
        }
    }
    return out;
}

function collectFromNavigation(
    navigation: docsYml.RawSchemas.NavigationConfig | undefined,
    breadcrumb: string
): ChangelogLocation[] {
    if (navigation == null || !Array.isArray(navigation) || navigation.length === 0) {
        return [];
    }
    if (isTabbedNavigation(navigation)) {
        const out: ChangelogLocation[] = [];
        for (const item of navigation) {
            const next = `${breadcrumb} > tab "${item.tab}"`;
            if ("layout" in item && Array.isArray(item.layout)) {
                out.push(...collectChangelogLocations(item.layout, next));
            }
            if ("variants" in item && Array.isArray(item.variants)) {
                for (const variant of item.variants) {
                    const variantBreadcrumb = `${next} > variant "${variant.title}"`;
                    out.push(...collectChangelogLocations(variant.layout, variantBreadcrumb));
                }
            }
        }
        return out;
    }
    return collectChangelogLocations(navigation as docsYml.RawSchemas.UntabbedNavigationConfig, breadcrumb);
}

function violationsForLocations(locations: ChangelogLocation[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const loc of locations) {
        const lastSegment = getEffectiveChangelogSlugLastSegment(loc);
        if (lastSegment === "" || isAllowedChangelogSlug(lastSegment)) {
            continue;
        }
        const allowed = CHANGELOG_FEED_ALLOWED_SLUGS.join(", ");
        const sourceField =
            loc.slug != null ? `slug: "${loc.slug}"` : `title: "${loc.title ?? DEFAULT_CHANGELOG_TITLE}"`;
        violations.push({
            severity: "warning",
            message: `Changelog at ${loc.where} resolves to URL segment "${lastSegment}" (from ${sourceField}). The docs server only serves changelog feeds (.rss, .atom, .json) when the final URL segment is one of: ${allowed}. Rename the changelog's title or set an explicit slug to one of these values, otherwise subscribers will get a 404 when they request the feed.`
        });
    }
    return violations;
}

export const ValidChangelogSlugRule: Rule = {
    name: "valid-changelog-slug",
    create: () => {
        return {
            file: async ({ config }) => {
                const locations: ChangelogLocation[] = [
                    ...collectFromNavigation(config.navigation, "navigation"),
                    ...collectFromTabs(config.tabs, "tabs")
                ];
                return violationsForLocations(locations);
            },
            versionFile: async ({ path, content }) => {
                const parseResult = await validateVersionConfigFileSchema({ value: content });
                if (parseResult.type !== "success") {
                    return [];
                }
                const versionConfig = parseResult.contents;
                const locations: ChangelogLocation[] = [
                    ...collectFromNavigation(versionConfig.navigation, `version "${path}" navigation`),
                    ...collectFromTabs(versionConfig.tabs, `version "${path}" tabs`)
                ];
                return violationsForLocations(locations);
            },
            productFile: async ({ path, content }) => {
                const parseResult = await validateProductConfigFileSchema({ value: content });
                if (parseResult.type !== "success") {
                    return [];
                }
                const productConfig = parseResult.contents;
                const locations: ChangelogLocation[] = [
                    ...collectFromNavigation(productConfig.navigation, `product "${path}" navigation`),
                    ...collectFromTabs(productConfig.tabs, `product "${path}" tabs`)
                ];
                return violationsForLocations(locations);
            }
        };
    }
};

function isChangelog(item: docsYml.RawSchemas.NavigationItem): item is docsYml.RawSchemas.ChangelogConfiguration {
    return (item as docsYml.RawSchemas.ChangelogConfiguration)?.changelog != null;
}

function isSection(item: docsYml.RawSchemas.NavigationItem): item is docsYml.RawSchemas.SectionConfiguration {
    return (item as docsYml.RawSchemas.SectionConfiguration)?.section != null;
}

function isTabbedNavigation(
    navigation: docsYml.RawSchemas.NavigationConfig
): navigation is docsYml.RawSchemas.TabbedNavigationConfig {
    return (
        Array.isArray(navigation) &&
        navigation.length > 0 &&
        (navigation[0] as docsYml.RawSchemas.TabbedNavigationItem)?.tab != null
    );
}
