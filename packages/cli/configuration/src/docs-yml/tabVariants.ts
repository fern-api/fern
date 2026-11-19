import type * as RawSchemas from "./schemas/index.js";

export type RawTabVariantListItem = RawSchemas.TabVariantItem | RawSchemas.TabVariantGroupItem;

export function isRawTabVariantGroup(item: RawSchemas.TabVariantItem): item is RawSchemas.TabVariantGroup {
    return "group" in item;
}

export function isRawTabVariantLink(item: RawTabVariantListItem): item is RawSchemas.LinkConfiguration {
    return "link" in item;
}

export interface RawTabVariantWithPath {
    variant: RawSchemas.TabVariant;
    /** Path below the tab item, e.g. `["variants", "1", "items", "0"]` for a grouped variant. */
    path: string[];
}

/** Every variant in a tab's `variants` list, in order, with groups flattened and links skipped. */
export function flattenRawTabVariants(items: RawSchemas.TabVariantItem[]): RawTabVariantWithPath[] {
    return items.flatMap((item, index): RawTabVariantWithPath[] => {
        if (isRawTabVariantGroup(item)) {
            return item.items.flatMap((child, childIndex): RawTabVariantWithPath[] =>
                isRawTabVariantLink(child)
                    ? []
                    : [{ variant: child, path: ["variants", `${index}`, "items", `${childIndex}`] }]
            );
        }
        if (isRawTabVariantLink(item)) {
            return [];
        }
        return [{ variant: item, path: ["variants", `${index}`] }];
    });
}

export type RawTabWithVariantLayouts = RawSchemas.TabbedNavigationItemWithVariants;

/** Whether the tab's pages live under `variants` rather than a single `layout`. */
export function isRawTabWithVariantLayouts(item: RawSchemas.TabbedNavigationItem): item is RawTabWithVariantLayouts {
    return "variants" in item && Array.isArray(item.variants);
}

export function isRawTabMenuGroup(entry: RawSchemas.TabMenuEntry): entry is RawSchemas.TabMenuGroup {
    return "group" in entry;
}

export function isRawTabMenuLink(
    entry: RawSchemas.TabMenuEntry | RawSchemas.TabMenuGroupItem
): entry is RawSchemas.LinkConfiguration {
    return "link" in entry;
}

export interface RawTabMenuMemberWithPath {
    member: RawSchemas.TabMenuTab;
    /** Path below the menu tab's config, e.g. `["tab-menu", "0", "tabs", "1"]` for a grouped member. */
    path: string[];
}

/** Every tab in a `tab-menu`, in order, with groups flattened and links skipped. */
export function flattenRawTabMenu(entries: RawSchemas.TabMenuEntry[]): RawTabMenuMemberWithPath[] {
    return entries.flatMap((entry, index): RawTabMenuMemberWithPath[] => {
        if (isRawTabMenuGroup(entry)) {
            return entry.tabs.flatMap((child, childIndex): RawTabMenuMemberWithPath[] =>
                isRawTabMenuLink(child)
                    ? []
                    : [{ member: child, path: ["tab-menu", `${index}`, "tabs", `${childIndex}`] }]
            );
        }
        if (isRawTabMenuLink(entry)) {
            return [];
        }
        return [{ member: entry, path: ["tab-menu", `${index}`] }];
    });
}

export interface RawTabMenuMembership {
    menuTabId: string;
    menuTab: RawSchemas.TabConfig;
    member: RawSchemas.TabMenuTab;
    path: string[];
}

/** Tab-menu members by tab id. When a tab is listed in several menus, the first menu wins. */
export function getRawTabMenuMemberships(
    tabs: Record<string, RawSchemas.TabConfig> | undefined
): Map<string, RawTabMenuMembership> {
    const memberships = new Map<string, RawTabMenuMembership>();
    for (const [menuTabId, menuTab] of Object.entries(tabs ?? {})) {
        for (const { member, path } of flattenRawTabMenu(menuTab.tabMenu ?? [])) {
            if (!memberships.has(member.tab)) {
                memberships.set(member.tab, { menuTabId, menuTab, member, path });
            }
        }
    }
    return memberships;
}

/** A slug segment between the site root and a layout: a tab, tab-menu member or variant. */
export interface RawLayoutOwner {
    title: string;
    slug?: string;
    skipSlug?: boolean;
}

/**
 * The slug segments of a `navigation` tab: the tab itself, or the menu tab then the member for a tab-menu member.
 * Undefined when the tab isn't defined.
 */
export function getRawTabSlugOwners(
    tabs: Record<string, RawSchemas.TabConfig> | undefined,
    tabId: string
): RawLayoutOwner[] | undefined {
    const tab = tabs?.[tabId];
    if (tab != null) {
        return [{ title: tab.displayName, slug: tab.slug, skipSlug: tab.skipSlug }];
    }
    const membership = getRawTabMenuMemberships(tabs).get(tabId);
    if (membership == null) {
        return undefined;
    }
    const { menuTab, member } = membership;
    return [
        { title: menuTab.displayName, slug: menuTab.slug, skipSlug: menuTab.skipSlug },
        { title: member.displayName, slug: member.slug, skipSlug: member.skipSlug }
    ];
}

export interface RawTabLayout {
    /** The variant that owns `layout`. */
    owners: RawLayoutOwner[];
    layout: RawSchemas.NavigationItem[];
    /** Path below the tab item to the owner of `layout`. */
    path: string[];
}

/** Every `layout` under a tab's `variants`. */
export function flattenRawTabLayouts(tab: RawTabWithVariantLayouts): RawTabLayout[] {
    return flattenRawTabVariants(tab.variants).map(({ variant, path }) => ({
        owners: [variant],
        layout: variant.layout,
        path
    }));
}
