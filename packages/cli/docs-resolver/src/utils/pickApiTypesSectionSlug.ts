import type { FernNavigation } from "@fern-api/fdr-sdk";

export const API_TYPES_URL_SLUG = "types";
/** Used instead of `types` when a sibling already owns `<api>/types`. */
export const API_SCHEMAS_URL_SLUG = "schemas";

/**
 * Picks the url segment of the standalone types section: `types`, unless a sibling of the section
 * (the GraphQL types section, a package named "Types") already has that slug, then `schemas`, then
 * `types-2`, `types-3`, ... so the section never shares a URL with a sibling.
 */
export function pickApiTypesSectionSlug(
    parentSlug: FernNavigation.V1.SlugGenerator,
    siblingSlugs: ReadonlySet<string>
): string {
    const isFree = (segment: string): boolean => !siblingSlugs.has(parentSlug.append(segment).get());
    if (isFree(API_TYPES_URL_SLUG)) {
        return API_TYPES_URL_SLUG;
    }
    if (isFree(API_SCHEMAS_URL_SLUG)) {
        return API_SCHEMAS_URL_SLUG;
    }
    let n = 2;
    while (!isFree(`${API_TYPES_URL_SLUG}-${n}`)) {
        n++;
    }
    return `${API_TYPES_URL_SLUG}-${n}`;
}
