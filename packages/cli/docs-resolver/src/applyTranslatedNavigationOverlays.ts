import { docsYml } from "@fern-api/configuration";
import { FernNavigation } from "@fern-api/fdr-sdk";

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
 * - Tabs: matched by looking up the tab slug in the overlay's `tabs` map
 * - Variants: matched by variant slug first, then positionally among
 *   overlays without an explicit slug; the matched overlay's `layout:`
 *   becomes the scoped navigation context for the variant's children
 * - Sections/Pages: matched by slug first, then positionally within the
 *   currently scoped overlay's navigation items
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
            if (childObj["type"] === "tab") {
                const positionalTabId = orderedTabIds[tabIndex];
                tabIndex++;
                return applyTabOverlayToNode(childObj, overlay, positionalTabId);
            }
            return walkAndApply(child, overlay);
        });
    }

    // Varianted children → match each variant with overlay.variants, then
    // recurse with the per-variant layout scoped as the navigation overlay.
    if (parentType === "varianted") {
        const variantOverlays = collectVariantOverlaysFromTabLayout(overlay);
        if (variantOverlays != null && variantOverlays.length > 0) {
            return applyVariantOverlays(children, variantOverlays, overlay);
        }
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

    // Shallow-copy so we never mutate the input tree.
    const out: Record<string, unknown> = { ...node };

    // Look up tab display-name override from overlay.tabs.
    // Match precedence: slug-based match → positional fallback (covers
    // skip-slug tabs that collapse into the parent slug and therefore can't
    // be disambiguated by slug alone).
    let appliedTabId: string | undefined;
    if (overlay.tabs != null && tabSlug != null) {
        for (const [tabId, tabOverlay] of Object.entries(overlay.tabs)) {
            const isMatch = tabId === tabSlug || (tabOverlay.slug != null && tabOverlay.slug === tabSlug);
            if (isMatch && tabOverlay.displayName != null) {
                out["title"] = tabOverlay.displayName;
                appliedTabId = tabId;
                break;
            }
        }
    }
    if (appliedTabId == null && positionalTabId != null && overlay.tabs != null) {
        const tabOverlayEntry = overlay.tabs[positionalTabId];
        if (tabOverlayEntry?.displayName != null) {
            out["title"] = tabOverlayEntry.displayName;
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
                out["title"] = tabOverlayEntry.displayName;
            }
        }

        // Build a scoped overlay carrying both this tab's flat layout (for
        // non-variant tabs) and its variants (for variant tabs). Variants
        // are discovered downstream via the `varianted` parent-type branch.
        const scopedOverlay: docsYml.TranslationNavigationOverlay = {
            tabs: undefined,
            products: undefined,
            versions: undefined,
            announcement: undefined,
            navigation:
                tabNavOverlay.layout ??
                (tabNavOverlay.variants != null && tabNavOverlay.variants.length > 0
                    ? [{ type: "tab", tabId: tabNavOverlay.tabId, layout: undefined, variants: tabNavOverlay.variants }]
                    : undefined),
            navbarLinks: undefined
        };
        if (scopedOverlay.navigation != null) {
            // walkAndApply iterates over keys of `out` and produces a fully
            // new tree (children too); the title override we just set on
            // `out` is preserved because walkAndApply does not touch the
            // "title" key.
            return walkAndApply(out, scopedOverlay);
        }
    }

    return walkAndApply(out, overlay);
}

/**
 * Collects the variant overlays for the current scoped overlay. Inside a
 * tab's scoped overlay we surface variants via a synthetic Tab navigation
 * entry (see `applyTabOverlayToNode`); this helper unwraps that entry so
 * the `varianted` traversal can match variants positionally / by slug.
 */
function collectVariantOverlaysFromTabLayout(
    overlay: docsYml.TranslationNavigationOverlay
): docsYml.VariantOverlay[] | undefined {
    if (overlay.navigation == null) {
        return undefined;
    }
    for (const item of overlay.navigation) {
        if (item.type === "tab" && item.variants != null && item.variants.length > 0) {
            return item.variants;
        }
    }
    return undefined;
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
    let sectionIdx = 0;
    let pageIdx = 0;

    return children.map((child) => {
        const childObj = child as Record<string, unknown> | null;
        if (childObj == null || typeof childObj !== "object") {
            return walkAndApply(child, overlay);
        }

        const childType = childObj["type"] as string | undefined;

        if (childType === "section") {
            const sectionOverlays = navOverlays.filter(
                (item): item is docsYml.NavigationItemOverlay.Section => item.type === "section"
            );
            const matched = matchSectionOverlay(childObj, sectionOverlays, sectionIdx);
            sectionIdx++;

            if (matched != null) {
                const walked = walkAndApply(child, overlay) as Record<string, unknown>;
                if (matched.title != null) {
                    walked["title"] = matched.title;
                }
                if (matched.contents != null) {
                    // Re-apply section content overlays recursively
                    const childArray = walked["children"] as unknown[] | undefined;
                    if (childArray != null) {
                        walked["children"] = applySidebarChildOverlays(childArray, matched.contents, overlay);
                    }
                }
                return walked;
            }
            return walkAndApply(child, overlay);
        }

        if (childType === "page" || childType === "landingPage") {
            const pageOverlays = navOverlays.filter(
                (item): item is docsYml.NavigationItemOverlay.Page => item.type === "page"
            );
            const matched = matchPageOverlay(childObj, pageOverlays, pageIdx);
            pageIdx++;

            if (matched?.title != null) {
                const walked = walkAndApply(child, overlay) as Record<string, unknown>;
                walked["title"] = matched.title;
                return walked;
            }
            return walkAndApply(child, overlay);
        }

        return walkAndApply(child, overlay);
    });
}

function matchSectionOverlay(
    section: Record<string, unknown>,
    overlays: docsYml.NavigationItemOverlay.Section[],
    positionIndex: number
): docsYml.NavigationItemOverlay.Section | undefined {
    const sectionSlug = extractLastSlugSegment(section["slug"] as string | undefined);

    // First, try to match by slug
    for (const o of overlays) {
        if (o.slug != null && normalizeOverlaySlug(o.slug) === sectionSlug) {
            return o;
        }
    }

    // Positional fallback: prefer overlays without a slug (those are meant to
    // match by position) and fall back to all overlays positionally so that
    // overlay files mirroring the source navigation structure still resolve
    // when slugs don't line up exactly (e.g. tree slug `home` vs. overlay
    // slug `/`).
    const noSlugOverlays = overlays.filter((o) => o.slug == null);
    if (positionIndex < noSlugOverlays.length) {
        return noSlugOverlays[positionIndex];
    }
    if (noSlugOverlays.length === 0 && positionIndex < overlays.length) {
        return overlays[positionIndex];
    }
    return undefined;
}

function matchPageOverlay(
    page: Record<string, unknown>,
    overlays: docsYml.NavigationItemOverlay.Page[],
    positionIndex: number
): docsYml.NavigationItemOverlay.Page | undefined {
    const pageSlug = extractLastSlugSegment(page["slug"] as string | undefined);

    // First, try to match by slug
    for (const o of overlays) {
        if (o.slug != null && normalizeOverlaySlug(o.slug) === pageSlug) {
            return o;
        }
    }

    // Positional fallback: prefer overlays without a slug (those are meant to
    // match by position) and fall back to all overlays positionally so that
    // overlay files mirroring the source navigation structure still resolve
    // when slugs don't line up exactly (e.g. tree slug `home` vs. overlay
    // slug `/`).
    const noSlugOverlays = overlays.filter((o) => o.slug == null);
    if (positionIndex < noSlugOverlays.length) {
        return noSlugOverlays[positionIndex];
    }
    if (noSlugOverlays.length === 0 && positionIndex < overlays.length) {
        return overlays[positionIndex];
    }
    return undefined;
}

function extractLastSlugSegment(slug: string | undefined): string | undefined {
    if (slug == null) {
        return undefined;
    }
    const parts = slug.split("/");
    return parts[parts.length - 1];
}

/**
 * Normalises an overlay's `slug:` value for slug-based matching against a
 * tree node's resolved last-segment slug. Overlays mirror the docs.yml
 * syntax, where slugs can be absolute (`/`, `/path`) or relative (`leaf`).
 * The tree's slug, by contrast, is always the resolved final segment.
 */
function normalizeOverlaySlug(slug: string): string {
    if (slug === "/" || slug === "") {
        return "";
    }
    const trimmed = slug.startsWith("/") ? slug.slice(1) : slug;
    const parts = trimmed.split("/");
    return parts[parts.length - 1] ?? "";
}

/**
 * Applies variant overlays to tab variant children.
 *
 * Matching strategy:
 * - First tries to match by slug.
 * - Falls back to positional matching among overlays that have no slug,
 *   skipping noSlug overlays already consumed by an earlier sibling.
 *
 * For each matched variant the title/subtitle override is applied, and the
 * variant's children are walked with the overlay's `layout:` scoped as the
 * navigation context so nested sections/pages can be translated.
 */
function applyVariantOverlays(
    variants: unknown[],
    overlays: docsYml.VariantOverlay[],
    parentOverlay: docsYml.TranslationNavigationOverlay
): unknown[] {
    const consumedNoSlugIndices = new Set<number>();
    let noSlugCursor = 0;
    const noSlugOverlayIndices = overlays
        .map((o, idx) => ({ o, idx }))
        .filter(({ o }) => o.slug == null)
        .map(({ idx }) => idx);

    return variants.map((variant) => {
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

        // Positional fallback: walk through noSlug overlays in declaration
        // order, skipping any already consumed by an earlier variant.
        if (matchedOverlay == null) {
            while (noSlugCursor < noSlugOverlayIndices.length) {
                const overlayIdx = noSlugOverlayIndices[noSlugCursor];
                if (overlayIdx === undefined) {
                    break;
                }
                noSlugCursor++;
                if (consumedNoSlugIndices.has(overlayIdx)) {
                    continue;
                }
                consumedNoSlugIndices.add(overlayIdx);
                matchedOverlay = overlays[overlayIdx];
                break;
            }
        }

        if (matchedOverlay == null) {
            return walkAndApply(variant, parentOverlay);
        }

        const result: Record<string, unknown> = { ...variantObj };
        if (matchedOverlay.title != null) {
            result["title"] = matchedOverlay.title;
            // Also override variantId so downstream renderers that key off the
            // typed variant identifier (e.g. custom dropdowns built from the
            // navigation tree) display the translated label. The original
            // variantId mirrors the source `title` (see DocsDefinitionResolver
            // toVariantNode), so it is safe to keep these in sync per locale.
            result["variantId"] = matchedOverlay.title;
        }
        if (matchedOverlay.subtitle != null) {
            result["subtitle"] = matchedOverlay.subtitle;
        }

        // Scope the per-variant layout for the variant's children so nested
        // sections and pages get translated against the variant's overlay.
        // The variant node directly owns pages/sections (no sidebarRoot
        // wrapper) so we apply the layout overlays straight to its children.
        const children = Array.isArray(result["children"]) ? (result["children"] as unknown[]) : undefined;
        if (matchedOverlay.layout != null && children != null) {
            const variantScopedOverlay: docsYml.TranslationNavigationOverlay = {
                tabs: undefined,
                products: undefined,
                versions: undefined,
                announcement: undefined,
                navigation: matchedOverlay.layout,
                navbarLinks: undefined
            };
            result["children"] = applySidebarChildOverlays(children, matchedOverlay.layout, variantScopedOverlay);
            return result;
        }

        return walkAndApply(result, parentOverlay);
    });
}
