import { docsYml } from "@fern-api/configuration-loader";
import { kebabCase } from "lodash-es";

import { validateProductConfigFileSchema } from "../../docsAst/validateProductConfig.js";
import { validateVersionConfigFileSchema } from "../../docsAst/validateVersionConfig.js";
import { Rule, RuleViolation } from "../../Rule.js";

/**
 * Allowlist of slug names that may serve a docs changelog feed
 * (RSS / Atom / JSON). The docs middleware only rewrites
 * `<slug>.{rss,atom,json}` to the changelog handler when at least one
 * segment of `<slug>` matches one of these names — otherwise the request
 * falls through to a normal 404. This rule enforces the same list at
 * `fern check` time so customers never get a confusingly-empty feed.
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
 * Computes the URL segments contributed by a changelog node itself. Mirrors
 * the slug computation in `packages/cli/docs-resolver/src/ChangelogNodeConverter.ts`:
 * the changelog node's own URL piece is `slug ?? kebabCase(title ?? "Changelog")`,
 * which may be a nested path like `v2/release-notes`.
 */
export function getEffectiveChangelogSlugSegments(config: { slug?: string; title?: string }): string[] {
    const raw = config.slug ?? kebabCase(config.title ?? DEFAULT_CHANGELOG_TITLE);
    return splitSegments(raw);
}

/**
 * @deprecated kept for backwards compatibility. Prefer
 * {@link getEffectiveChangelogSlugSegments} which returns all segments —
 * the docs middleware now allows any segment to be allowlisted, not just
 * the trailing one.
 */
export function getEffectiveChangelogSlugLastSegment(config: { slug?: string; title?: string }): string {
    const segments = getEffectiveChangelogSlugSegments(config);
    return segments[segments.length - 1] ?? "";
}

export function isAllowedChangelogSlug(segment: string): boolean {
    return CHANGELOG_FEED_ALLOWED_SLUGS.includes(segment);
}

/**
 * Returns true when at least one segment in the supplied list is an
 * allowlisted changelog feed slug. The list represents the full URL path
 * to the changelog (ancestor slugs + the changelog node's own slug
 * segments), so a single allowlisted segment anywhere in the trail is
 * enough to make the feed servable.
 */
export function hasAllowedChangelogSegment(segments: readonly string[]): boolean {
    return segments.some((segment) => isAllowedChangelogSlug(segment));
}

/**
 * Computes the URL segments contributed by an ancestor node (tab, section,
 * variant, etc.). An ancestor with `skip-slug: true` contributes nothing to
 * the URL; otherwise it uses `slug` (which may itself be multi-segment) or
 * falls back to the kebab-cased display name.
 */
function ancestorSlugSegments(opts: { slug?: string; displayName?: string; skipSlug?: boolean }): string[] {
    if (opts.skipSlug) {
        return [];
    }
    const raw = opts.slug ?? kebabCase(opts.displayName ?? "");
    return splitSegments(raw);
}

function splitSegments(raw: string): string[] {
    return raw.split("/").filter((segment) => segment.length > 0);
}

interface ChangelogLocation {
    where: string;
    slug?: string;
    title?: string;
    /** Slug segments contributed by every ancestor in the navigation tree. */
    ancestorSegments: string[];
}

function collectChangelogLocations(
    items: docsYml.RawSchemas.NavigationItem[] | undefined,
    breadcrumb: string,
    ancestorSegments: string[]
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
                title: item.title,
                ancestorSegments
            });
            continue;
        }
        if (isSection(item)) {
            const next = `${breadcrumb} > section "${item.section}"`;
            const sectionSegments = ancestorSlugSegments({
                slug: item.slug,
                displayName: item.section,
                skipSlug: item.skipSlug
            });
            out.push(...collectChangelogLocations(item.contents, next, [...ancestorSegments, ...sectionSegments]));
        }
        // Folders have no nested navigation items in docs.yml today, so a
        // changelog cannot live inside one — no recursion needed.
    }
    return out;
}

function collectFromTabs(
    tabs: Record<string, docsYml.RawSchemas.TabConfig> | undefined,
    breadcrumb: string,
    ancestorSegments: string[]
): ChangelogLocation[] {
    if (tabs == null) {
        return [];
    }
    const out: ChangelogLocation[] = [];
    for (const [tabId, tab] of Object.entries(tabs)) {
        if (tab.changelog != null) {
            // For a tab-level `changelog` field, the tab IS the changelog
            // node — its slug/displayName define the leaf URL segment, so
            // we don't add tabSegments to `ancestorSegments` (that would
            // double-count). `getEffectiveChangelogSlugSegments` derives
            // them from `slug`/`title` on the location itself.
            out.push({
                where: `${breadcrumb} > tab "${tabId}" (changelog: ${tab.changelog})`,
                slug: tab.slug,
                title: tab.displayName,
                ancestorSegments
            });
        }
    }
    return out;
}

function collectFromNavigation(
    navigation: docsYml.RawSchemas.NavigationConfig | undefined,
    tabs: Record<string, docsYml.RawSchemas.TabConfig> | undefined,
    breadcrumb: string,
    ancestorSegments: string[]
): ChangelogLocation[] {
    if (navigation == null || !Array.isArray(navigation) || navigation.length === 0) {
        return [];
    }
    if (isTabbedNavigation(navigation)) {
        const out: ChangelogLocation[] = [];
        for (const item of navigation) {
            const next = `${breadcrumb} > tab "${item.tab}"`;
            const tabConfig = tabs?.[item.tab];
            const tabSegments = ancestorSlugSegments({
                slug: tabConfig?.slug,
                displayName: tabConfig?.displayName ?? item.tab,
                skipSlug: tabConfig?.skipSlug
            });
            const tabAncestors = [...ancestorSegments, ...tabSegments];
            if ("layout" in item && Array.isArray(item.layout)) {
                out.push(...collectChangelogLocations(item.layout, next, tabAncestors));
            }
            if ("variants" in item && Array.isArray(item.variants)) {
                for (const variant of item.variants) {
                    const variantBreadcrumb = `${next} > variant "${variant.title}"`;
                    const variantSegments = ancestorSlugSegments({
                        slug: variant.slug,
                        displayName: variant.title,
                        skipSlug: variant.skipSlug
                    });
                    out.push(
                        ...collectChangelogLocations(variant.layout, variantBreadcrumb, [
                            ...tabAncestors,
                            ...variantSegments
                        ])
                    );
                }
            }
        }
        return out;
    }
    return collectChangelogLocations(
        navigation as docsYml.RawSchemas.UntabbedNavigationConfig,
        breadcrumb,
        ancestorSegments
    );
}

function violationsForLocations(locations: ChangelogLocation[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const loc of locations) {
        const ownSegments = getEffectiveChangelogSlugSegments(loc);
        const allSegments = [...loc.ancestorSegments, ...ownSegments];
        if (allSegments.length === 0 || hasAllowedChangelogSegment(allSegments)) {
            continue;
        }
        const allowed = CHANGELOG_FEED_ALLOWED_SLUGS.join(", ");
        const sourceField =
            loc.slug != null ? `slug: "${loc.slug}"` : `title: "${loc.title ?? DEFAULT_CHANGELOG_TITLE}"`;
        const fullPath = "/" + allSegments.join("/");
        violations.push({
            severity: "error",
            message: `Changelog at ${loc.where} resolves to URL path "${fullPath}" (from ${sourceField}). The docs server only serves changelog feeds (.rss, .atom, .json) when at least one segment of the URL is one of: ${allowed}. Rename the changelog (or one of its parent tabs/sections), or set an explicit slug to one of these values, otherwise subscribers will get a 404 when they request the feed.`
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
                    ...collectFromNavigation(config.navigation, config.tabs, "navigation", []),
                    ...collectFromTabs(config.tabs, "tabs", [])
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
                    ...collectFromNavigation(
                        versionConfig.navigation,
                        versionConfig.tabs,
                        `version "${path}" navigation`,
                        []
                    ),
                    ...collectFromTabs(versionConfig.tabs, `version "${path}" tabs`, [])
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
                    ...collectFromNavigation(
                        productConfig.navigation,
                        productConfig.tabs,
                        `product "${path}" navigation`,
                        []
                    ),
                    ...collectFromTabs(productConfig.tabs, `product "${path}" tabs`, [])
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
