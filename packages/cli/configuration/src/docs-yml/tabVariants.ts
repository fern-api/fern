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
    /** Path below the tab item, e.g. `["variants", "1", "variants", "0"]` for a grouped variant. */
    path: string[];
}

/** Every variant in a tab's `variants` list, in order, with groups flattened and links skipped. */
export function flattenRawTabVariants(items: RawSchemas.TabVariantItem[]): RawTabVariantWithPath[] {
    return items.flatMap((item, index): RawTabVariantWithPath[] => {
        if (isRawTabVariantGroup(item)) {
            return item.variants.flatMap((child, childIndex): RawTabVariantWithPath[] =>
                isRawTabVariantLink(child)
                    ? []
                    : [{ variant: child, path: ["variants", `${index}`, "variants", `${childIndex}`] }]
            );
        }
        if (isRawTabVariantLink(item)) {
            return [];
        }
        return [{ variant: item, path: ["variants", `${index}`] }];
    });
}

export function isRawDropdownGroup(item: RawSchemas.DropdownEntry): item is RawSchemas.DropdownGroup {
    return "group" in item;
}

export function isRawDropdownLink(
    item: RawSchemas.DropdownEntry | RawSchemas.DropdownGroupItem
): item is RawSchemas.LinkConfiguration {
    return "link" in item;
}

export type RawTabWithVariantLayouts =
    | RawSchemas.TabbedNavigationItemWithVariants
    | RawSchemas.TabbedNavigationItemWithDropdown;

export function isRawTabWithDropdown(
    item: RawSchemas.TabbedNavigationItem
): item is RawSchemas.TabbedNavigationItemWithDropdown {
    return "dropdown" in item && Array.isArray(item.dropdown);
}

/** Whether the tab's pages live under `variants` or `dropdown` items rather than a single `layout`. */
export function isRawTabWithVariantLayouts(item: RawSchemas.TabbedNavigationItem): item is RawTabWithVariantLayouts {
    return isRawTabWithDropdown(item) || ("variants" in item && Array.isArray(item.variants));
}

export interface RawDropdownItemWithPath {
    item: RawSchemas.DropdownItem;
    /** Path below the tab item, e.g. `["dropdown", "0", "items", "1"]` for a grouped item. */
    path: string[];
}

/** Every item in a tab's `dropdown` list, in order, with groups flattened and links skipped. */
export function flattenRawDropdownItems(entries: RawSchemas.DropdownEntry[]): RawDropdownItemWithPath[] {
    return entries.flatMap((entry, index): RawDropdownItemWithPath[] => {
        if (isRawDropdownGroup(entry)) {
            return entry.items.flatMap((child, childIndex): RawDropdownItemWithPath[] =>
                isRawDropdownLink(child)
                    ? []
                    : [{ item: child, path: ["dropdown", `${index}`, "items", `${childIndex}`] }]
            );
        }
        if (isRawDropdownLink(entry)) {
            return [];
        }
        return [{ item: entry, path: ["dropdown", `${index}`] }];
    });
}

/** A slug segment between the tab and a layout: a variant or a dropdown item. */
export interface RawLayoutOwner {
    title: string;
    slug?: string;
    skipSlug?: boolean;
}

export interface RawTabLayout {
    /** Outermost first: a dropdown item, then its variant when it has `variants`. */
    owners: RawLayoutOwner[];
    layout: RawSchemas.NavigationItem[];
    /** Path below the tab item to the owner of `layout`. */
    path: string[];
}

/** Every `layout` under a tab's `variants` or `dropdown`, including variants nested under dropdown items. */
export function flattenRawTabLayouts(tab: RawTabWithVariantLayouts): RawTabLayout[] {
    if (!isRawTabWithDropdown(tab)) {
        return flattenRawTabVariants(tab.variants).map(({ variant, path }) => ({
            owners: [variant],
            layout: variant.layout,
            path
        }));
    }
    return flattenRawDropdownItems(tab.dropdown).flatMap(({ item, path }): RawTabLayout[] => {
        if (item.variants != null) {
            return flattenRawTabVariants(item.variants).map((nested) => ({
                owners: [item, nested.variant],
                layout: nested.variant.layout,
                path: [...path, ...nested.path]
            }));
        }
        return [{ owners: [item], layout: item.layout ?? [], path }];
    });
}
