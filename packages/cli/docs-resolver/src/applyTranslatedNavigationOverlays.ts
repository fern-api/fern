import { docsYml } from "@fern-api/configuration";
import { FernNavigation } from "@fern-api/fdr-sdk";

/**
 * Applies translated navigation overlays to the resolved nav tree.
 *
 * This walks the navigation tree (as a plain object) and overrides `title`,
 * `subtitle`, and `announcement` fields based on the overlay data parsed from
 * `translations/<lang>/fern/docs.yml` and nav YAML files.
 *
 * Matching strategy:
 * - Products: matched positionally against the overlay's products array
 * - Versions: matched positionally against the overlay's versions array
 * - Tabs: matched by looking up the tab slug in the overlay's `tabs` map
 * - Sections/Pages: matched positionally within the overlay's navigation items
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
                // Create a scoped overlay with product-specific tabs/navigation
                const scopedOverlay: docsYml.TranslationNavigationOverlay = {
                    tabs: productOverlay.tabs ?? overlay.tabs,
                    products: undefined,
                    versions: overlay.versions,
                    announcement: productOverlay.announcement ?? overlay.announcement,
                    navigation: productOverlay.navigation ?? overlay.navigation
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
            const walked = walkAndApply(child, overlay) as Record<string, unknown>;
            if (versionOverlay != null) {
                return applyVersionOverlayToNode(walked, versionOverlay);
            }
            return walked;
        });
    }

    // Tabbed children → match tabs with overlay.tabs and overlay.navigation
    if (parentType === "tabbed") {
        return children.map((child) => {
            const childObj = child as Record<string, unknown> | null;
            if (childObj == null || typeof childObj !== "object") {
                return walkAndApply(child, overlay);
            }
            if (childObj["type"] === "tab") {
                const walked = walkAndApply(child, overlay) as Record<string, unknown>;
                return applyTabOverlayToNode(walked, overlay);
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

function applyTabOverlayToNode(node: Record<string, unknown>, overlay: docsYml.TranslationNavigationOverlay): unknown {
    const tabSlug = extractLastSlugSegment(node["slug"] as string | undefined);

    // Look up tab display-name override from overlay.tabs
    if (overlay.tabs != null && tabSlug != null) {
        for (const [tabId, tabOverlay] of Object.entries(overlay.tabs)) {
            // Match by tab ID (YAML key) against nav tree slug segment, or
            // by the overlay's explicit slug field against the slug segment
            const isMatch = tabId === tabSlug || (tabOverlay.slug != null && tabOverlay.slug === tabSlug);
            if (isMatch && tabOverlay.displayName != null) {
                node["title"] = tabOverlay.displayName;
                break;
            }
        }
    }

    // Find matching tab navigation overlay for child overrides
    const tabNavOverlay = findTabNavOverlay(tabSlug, overlay);

    if (tabNavOverlay != null) {
        // Apply tab title override from the tabs map if not already applied
        if (overlay.tabs != null) {
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
                navigation: tabNavOverlay.layout
            };
            return walkAndApply(node, scopedOverlay);
        }
    }

    return walkAndApply(node, overlay);
}

function findTabNavOverlay(
    tabSlug: string | undefined,
    overlay: docsYml.TranslationNavigationOverlay
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

    return undefined;
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
        if (o.slug != null && o.slug === sectionSlug) {
            return o;
        }
    }

    // Positional fallback: only use overlays that don't have a slug defined,
    // to avoid incorrectly applying a slug-targeted overlay to the wrong sibling.
    const noSlugOverlays = overlays.filter((o) => o.slug == null);
    if (positionIndex < noSlugOverlays.length) {
        return noSlugOverlays[positionIndex];
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
        if (o.slug != null && o.slug === pageSlug) {
            return o;
        }
    }

    // Positional fallback: only use overlays that don't have a slug defined,
    // to avoid incorrectly applying a slug-targeted overlay to the wrong sibling.
    const noSlugOverlays = overlays.filter((o) => o.slug == null);
    if (positionIndex < noSlugOverlays.length) {
        return noSlugOverlays[positionIndex];
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
