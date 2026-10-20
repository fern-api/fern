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
