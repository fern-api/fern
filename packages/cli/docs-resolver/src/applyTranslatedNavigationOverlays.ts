import { docsYml } from "@fern-api/configuration";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { kebabCase } from "lodash-es";

/**
 * Applies translated navigation overlays to the resolved nav tree.
 *
 * This walks the navigation tree (as a plain object) and overrides `title`,
 * `subtitle`, and `announcement` fields based on the overlay data parsed from
 * `translations/<lang>/docs.yml` (or `translations/<lang>/fern/docs.yml` for
 * backwards compatibility) and nav YAML files.
 *
 * Matching strategy:
 * - Products: matched positionally against the overlay's products array
 * - Versions: matched positionally against the overlay's versions array
 * - Tabs (including changelog tabs): matched by looking up the tab slug in the overlay's `tabs` map
 * - Sections/Pages/API references/endpoints: matched by explicit slug (last segment) first,
 *   otherwise positionally among the slugless overlay entries of the same kind
 * - Links: matched positionally among sibling links
 * - API packages: matched by package name (or explicit slug), otherwise positionally
 */
export function applyTranslatedNavigationOverlays(
    root: FernNavigation.V1.RootNode | undefined,
    overlay: docsYml.TranslationNavigationOverlay
): FernNavigation.V1.RootNode | undefined {
    if (root == null) {
        return undefined;
    }

    const result = walkAndApply(root, overlay) as FernNavigation.V1.RootNode;
    return result;
}

/**
 * Returns the translated announcement text, or undefined if no override.
 */
export function getTranslatedAnnouncement(overlay: docsYml.TranslationNavigationOverlay): { text: string } | undefined {
    if (overlay.announcement?.message != null) {
        return { text: overlay.announcement.message };
    }
    return undefined;
}

function walkAndApply(node: unknown, overlay: docsYml.TranslationNavigationOverlay): unknown {
    if (node == null || typeof node !== "object") {
        return node;
    }
    if (Array.isArray(node)) {
        return node.map((item) => walkAndApply(item, overlay));
    }

    const obj = node as Record<string, unknown>;
    const updated: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(obj)) {
        if (k === "children" && Array.isArray(v)) {
            updated[k] = applyChildOverlays(v, obj, overlay);
        } else {
            updated[k] = walkAndApply(v, overlay);
        }
    }

    return updated;
}

function applyChildOverlays(
    children: unknown[],
    parent: Record<string, unknown>,
    overlay: docsYml.TranslationNavigationOverlay
): unknown[] {
    const parentType = parent["type"] as string | undefined;

    // Product group children → match with overlay.products
    if (parentType === "productgroup" && overlay.products != null) {
        return children.map((child, index) => {
            const childObj = child as Record<string, unknown> | null;
            if (childObj == null || typeof childObj !== "object") {
                return walkAndApply(child, overlay);
            }
            const productOverlay = findProductOverlay(childObj, overlay.products ?? [], index);
            if (productOverlay != null) {
                // Create a scoped overlay with product-specific tabs/navigation/versions
                const scopedOverlay: docsYml.TranslationNavigationOverlay = {
                    tabs: productOverlay.tabs ?? overlay.tabs,
                    products: undefined,
                    versions: productOverlay.versions ?? overlay.versions,
                    announcement: productOverlay.announcement ?? overlay.announcement,
                    navigation: productOverlay.navigation ?? overlay.navigation,
                    navbarLinks: overlay.navbarLinks
                };
                const walked = walkAndApply(child, scopedOverlay) as Record<string, unknown>;
                return applyProductOverlayToNode(walked, productOverlay);
            }
            return walkAndApply(child, overlay);
        });
    }

    // Versioned children → match with overlay.versions
    if (parentType === "versioned" && overlay.versions != null) {
        return children.map((child, index) => {
            const childObj = child as Record<string, unknown> | null;
            if (childObj == null || typeof childObj !== "object") {
                return walkAndApply(child, overlay);
            }
            const versionOverlay = findVersionOverlay(childObj, overlay.versions ?? [], index);
            if (versionOverlay != null) {
                // Create a scoped overlay with version-specific tabs/navigation
                const scopedOverlay: docsYml.TranslationNavigationOverlay = {
                    tabs: versionOverlay.tabs ?? overlay.tabs,
                    products: undefined,
                    versions: undefined,
                    announcement: overlay.announcement,
                    navigation: versionOverlay.navigation ?? overlay.navigation,
                    navbarLinks: overlay.navbarLinks
                };
                const walked = walkAndApply(child, scopedOverlay) as Record<string, unknown>;
                return applyVersionOverlayToNode(walked, versionOverlay);
            }
            return walkAndApply(child, overlay);
        });
    }

    // Tabbed children → match tabs with overlay.tabs and overlay.navigation.
    // Track tab position among siblings so we can fall back to positional
    // matching when slug-based matching fails (e.g. skip-slug tabs that
    // collapse into the parent slug and therefore all share the same slug).
    if (parentType === "tabbed") {
        const orderedTabIds = collectOrderedTabIds(overlay);
        let tabIndex = 0;
        return children.map((child) => {
            const childObj = child as Record<string, unknown> | null;
            if (childObj == null || typeof childObj !== "object") {
                return walkAndApply(child, overlay);
            }
            if (isTabLikeNode(childObj)) {
                const positionalTabId = orderedTabIds[tabIndex];
                tabIndex++;
                const walked = walkAndApply(child, overlay) as Record<string, unknown>;
                return applyTabOverlayToNode(walked, overlay, positionalTabId);
            }
            return walkAndApply(child, overlay);
        });
    }

    // SidebarRoot children → match sections/pages with overlay.navigation
    if (parentType === "sidebarRoot") {
        const navOverlays = collectFlatNavigationOverlays(overlay);
        if (navOverlays.length > 0) {
            return applySidebarChildOverlays(children, navOverlays, overlay);
        }
    }

    // SidebarGroup children → match sections/pages with overlay.navigation
    // This handles top-level pages that are wrapped in sidebarGroup nodes by DocsDefinitionResolver
    if (parentType === "sidebarGroup") {
        const navOverlays = collectFlatNavigationOverlays(overlay);
        if (navOverlays.length > 0) {
            return applySidebarChildOverlays(children, navOverlays, overlay);
        }
    }

    // Section children → recursively apply section content overlays
    if (parentType === "section") {
        // Section children are handled via the section overlay's contents
        // This is managed through the section overlay propagation
        return children.map((child) => walkAndApply(child, overlay));
    }

    return children.map((child) => walkAndApply(child, overlay));
}

/**
 * Changelog tabs resolve to a `changelog` node rather than a `tab` node, but
 * occupy a tab slot and are configured under `tabs` like any other tab.
 */
function isTabLikeNode(node: Record<string, unknown>): boolean {
    return node["type"] === "tab" || node["type"] === "changelog";
}

function findProductOverlay(
    node: Record<string, unknown>,
    products: docsYml.ProductOverlay[],
    index: number
): docsYml.ProductOverlay | undefined {
    // Match by slug
    const nodeSlug = extractLastSlugSegment(node["slug"] as string | undefined);
    if (nodeSlug != null) {
        for (const p of products) {
            if (p.slug != null && p.slug === nodeSlug) {
                return p;
            }
        }
    }

    // Match by productId/title
    const nodeTitle = node["title"] as string | undefined;
    const nodeProductId = node["productId"] as string | undefined;
    for (const p of products) {
        if (p.displayName != null) {
            if (nodeTitle === p.displayName || nodeProductId === p.displayName) {
                return p;
            }
        }
    }

    // Fall back to positional
    if (index < products.length) {
        return products[index];
    }

    return undefined;
}

function findVersionOverlay(
    node: Record<string, unknown>,
    versions: docsYml.VersionOverlay[],
    index: number
): docsYml.VersionOverlay | undefined {
    const nodeSlug = extractLastSlugSegment(node["slug"] as string | undefined);
    if (nodeSlug != null) {
        for (const v of versions) {
            if (v.slug != null && v.slug === nodeSlug) {
                return v;
            }
        }
    }

    const nodeTitle = node["title"] as string | undefined;
    const nodeVersionId = node["versionId"] as string | undefined;
    for (const v of versions) {
        if (v.displayName != null) {
            if (nodeTitle === v.displayName || nodeVersionId === v.displayName) {
                return v;
            }
        }
    }

    if (index < versions.length) {
        return versions[index];
    }

    return undefined;
}

function applyProductOverlayToNode(
    node: Record<string, unknown>,
    productOverlay: docsYml.ProductOverlay
): Record<string, unknown> {
    if (productOverlay.displayName != null) {
        node["title"] = productOverlay.displayName;
    }
    if (productOverlay.subtitle != null) {
        node["subtitle"] = productOverlay.subtitle;
    }
    if (productOverlay.announcement?.message != null) {
        node["announcement"] = { text: productOverlay.announcement.message };
    }
    return node;
}

function applyVersionOverlayToNode(
    node: Record<string, unknown>,
    versionOverlay: docsYml.VersionOverlay
): Record<string, unknown> {
    if (versionOverlay.displayName != null) {
        node["title"] = versionOverlay.displayName;
    }
    return node;
}

function applyTabOverlayToNode(
    node: Record<string, unknown>,
    overlay: docsYml.TranslationNavigationOverlay,
    positionalTabId?: string
): unknown {
    const tabSlug = extractLastSlugSegment(node["slug"] as string | undefined);

    // Look up tab display-name override from overlay.tabs.
    // Match precedence: slug-based match → positional fallback (covers
    // skip-slug tabs that collapse into the parent slug and therefore can't
    // be disambiguated by slug alone).
    let appliedTabId: string | undefined;
    if (overlay.tabs != null && tabSlug != null) {
        for (const [tabId, tabOverlay] of Object.entries(overlay.tabs)) {
            const isMatch = tabId === tabSlug || (tabOverlay.slug != null && tabOverlay.slug === tabSlug);
            if (isMatch && tabOverlay.displayName != null) {
                node["title"] = tabOverlay.displayName;
                appliedTabId = tabId;
                break;
            }
        }
    }
    if (appliedTabId == null && positionalTabId != null && overlay.tabs != null) {
        const tabOverlayEntry = overlay.tabs[positionalTabId];
        if (tabOverlayEntry?.displayName != null) {
            node["title"] = tabOverlayEntry.displayName;
            appliedTabId = positionalTabId;
        }
    }

    // Find matching tab navigation overlay for child overrides
    const tabNavOverlay = findTabNavOverlay(tabSlug, overlay, positionalTabId);

    if (tabNavOverlay != null) {
        // Apply tab title override from the tabs map if not already applied
        if (overlay.tabs != null && appliedTabId == null) {
            const tabOverlayEntry = overlay.tabs[tabNavOverlay.tabId];
            if (tabOverlayEntry?.displayName != null) {
                node["title"] = tabOverlayEntry.displayName;
            }
        }

        // Handle tab variants if present
        if (tabNavOverlay.variants != null && tabNavOverlay.variants.length > 0) {
            const tabChild = node["child"] as Record<string, unknown> | undefined;
            if (tabChild != null && tabChild["type"] === "variants") {
                const variantsChildren = tabChild["children"] as unknown[] | undefined;
                if (variantsChildren != null) {
                    tabChild["children"] = applyVariantOverlays(variantsChildren, tabNavOverlay.variants);
                }
            }
        }

        // Create a scoped overlay for this tab's children
        if (tabNavOverlay.layout != null) {
            const scopedOverlay: docsYml.TranslationNavigationOverlay = {
                tabs: undefined,
                products: undefined,
                versions: undefined,
                announcement: undefined,
                navigation: tabNavOverlay.layout,
                navbarLinks: undefined
            };
            return walkAndApply(node, scopedOverlay);
        }
    }

    return walkAndApply(node, overlay);
}

function findTabNavOverlay(
    tabSlug: string | undefined,
    overlay: docsYml.TranslationNavigationOverlay,
    positionalTabId?: string
): docsYml.NavigationItemOverlay.Tab | undefined {
    if (overlay.navigation == null) {
        return undefined;
    }

    for (const navItem of overlay.navigation) {
        if (navItem.type !== "tab") {
            continue;
        }
        // Match by tab ID against slug
        if (tabSlug != null && navItem.tabId === tabSlug) {
            return navItem;
        }
        // Match by overlay tab's explicit slug field against the nav tree slug
        if (tabSlug != null && overlay.tabs != null) {
            const tabConfig = overlay.tabs[navItem.tabId];
            if (tabConfig?.slug != null && tabConfig.slug === tabSlug) {
                return navItem;
            }
        }
    }

    // Positional fallback: when slug-based matching fails, use the tab's
    // position among siblings (passed in by `applyChildOverlays`) to find
    // the corresponding entry in overlay.navigation by tabId.
    if (positionalTabId != null) {
        for (const navItem of overlay.navigation) {
            if (navItem.type === "tab" && navItem.tabId === positionalTabId) {
                return navItem;
            }
        }
    }

    return undefined;
}

/**
 * Returns the ordered list of tab IDs from the overlay, preferring the order
 * declared in `overlay.navigation` (which mirrors the source navigation
 * ordering). Falls back to the insertion order of `overlay.tabs` if no
 * navigation is defined.
 */
function collectOrderedTabIds(overlay: docsYml.TranslationNavigationOverlay): string[] {
    if (overlay.navigation != null) {
        const fromNavigation = overlay.navigation
            .filter((item): item is docsYml.NavigationItemOverlay.Tab => item.type === "tab")
            .map((item) => item.tabId);
        if (fromNavigation.length > 0) {
            return fromNavigation;
        }
    }
    if (overlay.tabs != null) {
        return Object.keys(overlay.tabs);
    }
    return [];
}

/**
 * Collects all non-tab navigation overlays (sections and pages) from the overlay's
 * navigation items, flattening tab layouts into a single list.
 */
function collectFlatNavigationOverlays(overlay: docsYml.TranslationNavigationOverlay): docsYml.NavigationItemOverlay[] {
    if (overlay.navigation == null) {
        return [];
    }

    // If the navigation contains tab items, the sidebar content is inside
    // each tab's layout — those are handled by applyTabOverlayToNode.
    // For untabbed navigation, return all items directly.
    const nonTabItems = overlay.navigation.filter((item) => item.type !== "tab");
    return nonTabItems;
}

function applySidebarChildOverlays(
    children: unknown[],
    navOverlays: docsYml.NavigationItemOverlay[],
    overlay: docsYml.TranslationNavigationOverlay
): unknown[] {
    const sectionOverlays = navOverlays.filter(
        (item): item is docsYml.NavigationItemOverlay.Section => item.type === "section"
    );
    const pageOverlays = navOverlays.filter((item): item is docsYml.NavigationItemOverlay.Page => item.type === "page");
    const linkOverlays = navOverlays.filter((item): item is docsYml.NavigationItemOverlay.Link => item.type === "link");
    const apiOverlays = navOverlays.filter(
        (item): item is docsYml.NavigationItemOverlay.ApiReference => item.type === "apiReference"
    );
    const packageOverlays = navOverlays.filter(
        (item): item is docsYml.NavigationItemOverlay.ApiPackage => item.type === "apiPackage"
    );
    const endpointOverlays = navOverlays.filter(
        (item): item is docsYml.NavigationItemOverlay.Endpoint => item.type === "endpoint"
    );

    // Positional counters only advance for base siblings that were NOT matched
    // by an explicit slug, so an overlay that copies explicit slugs from the base
    // does not shift the positional matching of the slugless siblings after it.
    const sectionPos = { index: 0 };
    const pagePos = { index: 0 };
    const linkPos = { index: 0 };
    const apiPos = { index: 0 };
    const packagePos = { index: 0 };
    const endpointPos = { index: 0 };

    return children.map((child) => {
        const childObj = child as Record<string, unknown> | null;
        if (childObj == null || typeof childObj !== "object") {
            return walkAndApply(child, overlay);
        }

        const childType = childObj["type"] as string | undefined;

        if (childType === "section") {
            const matched = matchSluggedOverlay(childObj, sectionOverlays, sectionPos);
            return applyContainerOverlay(child, overlay, matched?.title, matched?.contents);
        }

        if (childType === "page" || childType === "landingPage") {
            const matched = matchSluggedOverlay(childObj, pageOverlays, pagePos);
            return applyTitleOverlay(child, overlay, matched?.title);
        }

        if (childType === "link") {
            const matched = linkOverlays[linkPos.index];
            linkPos.index++;
            return applyTitleOverlay(child, overlay, matched?.title);
        }

        if (childType === "apiReference") {
            const matched = matchSluggedOverlay(childObj, apiOverlays, apiPos);
            return applyContainerOverlay(child, overlay, matched?.title, matched?.layout);
        }

        if (childType === "apiPackage") {
            const matched = matchPackageOverlay(childObj, packageOverlays, packagePos);
            return applyContainerOverlay(child, overlay, matched?.title, matched?.contents);
        }

        if (childType === "endpoint" || childType === "webSocket" || childType === "webhook") {
            const matched = matchSluggedOverlay(childObj, endpointOverlays, endpointPos);
            return applyTitleOverlay(child, overlay, matched?.title);
        }

        return walkAndApply(child, overlay);
    });
}

function applyTitleOverlay(
    child: unknown,
    overlay: docsYml.TranslationNavigationOverlay,
    title: string | undefined
): unknown {
    const walked = walkAndApply(child, overlay) as Record<string, unknown>;
    if (title != null) {
        walked["title"] = title;
    }
    return walked;
}

function applyContainerOverlay(
    child: unknown,
    overlay: docsYml.TranslationNavigationOverlay,
    title: string | undefined,
    contents: docsYml.NavigationItemOverlay[] | undefined
): unknown {
    const walked = walkAndApply(child, overlay) as Record<string, unknown>;
    if (title != null) {
        walked["title"] = title;
    }
    if (contents != null) {
        const childArray = walked["children"] as unknown[] | undefined;
        if (childArray != null) {
            walked["children"] = applySidebarChildOverlays(childArray, contents, overlay);
        }
    }
    return walked;
}

interface PositionalCounter {
    index: number;
}

/**
 * Matches a base node against overlays of the same kind: first by explicit slug
 * (comparing the last slug segment on both sides, so multi-segment explicit slugs
 * such as `customization/voice` match), then positionally among the slugless
 * overlays. The positional counter is advanced only when no slug match occurred.
 */
function matchSluggedOverlay<T extends { slug: string | undefined }>(
    node: Record<string, unknown>,
    overlays: T[],
    position: PositionalCounter
): T | undefined {
    const nodeSlug = extractLastSlugSegment(node["slug"] as string | undefined);
    if (nodeSlug != null) {
        const bySlug = overlays.find((o) => o.slug != null && extractLastSlugSegment(o.slug) === nodeSlug);
        if (bySlug != null) {
            return bySlug;
        }
    }

    const noSlugOverlays = overlays.filter((o) => o.slug == null);
    const matched = noSlugOverlays[position.index];
    position.index++;
    return matched;
}

/**
 * Matches an `apiPackage` node against package overlays by explicit slug or by
 * the package name (whose kebab-case form is the default package url slug),
 * falling back to position among the remaining package overlays.
 */
function matchPackageOverlay(
    node: Record<string, unknown>,
    overlays: docsYml.NavigationItemOverlay.ApiPackage[],
    position: PositionalCounter
): docsYml.NavigationItemOverlay.ApiPackage | undefined {
    const nodeSlug = extractLastSlugSegment(node["slug"] as string | undefined);
    if (nodeSlug != null) {
        const byName = overlays.find((o) => {
            const overlaySlug = o.slug != null ? extractLastSlugSegment(o.slug) : kebabCase(o.packageName);
            return overlaySlug === nodeSlug;
        });
        if (byName != null) {
            return byName;
        }
    }

    const matched = overlays[position.index];
    position.index++;
    return matched;
}

function extractLastSlugSegment(slug: string | undefined): string | undefined {
    if (slug == null) {
        return undefined;
    }
    const parts = slug.split("/");
    return parts[parts.length - 1];
}

/**
 * Applies variant overlays to tab variant children.
 * Matches variants by slug first, then falls back to positional matching.
 */
function applyVariantOverlays(variants: unknown[], overlays: docsYml.VariantOverlay[]): unknown[] {
    return variants.map((variant, index) => {
        const variantObj = variant as Record<string, unknown> | null;
        if (variantObj == null || typeof variantObj !== "object") {
            return variant;
        }

        const variantSlug = extractLastSlugSegment(variantObj["slug"] as string | undefined);
        let matchedOverlay: docsYml.VariantOverlay | undefined;

        // First, try to match by slug
        if (variantSlug != null) {
            matchedOverlay = overlays.find((o) => o.slug != null && o.slug === variantSlug);
        }

        // Positional fallback: only use overlays that don't have a slug defined
        if (matchedOverlay == null) {
            const noSlugOverlays = overlays.filter((o) => o.slug == null);
            if (index < noSlugOverlays.length) {
                matchedOverlay = noSlugOverlays[index];
            }
        }

        if (matchedOverlay != null) {
            const result = { ...variantObj };
            if (matchedOverlay.title != null) {
                result["title"] = matchedOverlay.title;
            }
            if (matchedOverlay.subtitle != null) {
                result["subtitle"] = matchedOverlay.subtitle;
            }
            return result;
        }

        return variant;
    });
}
