import type { FernNavigation } from "@fern-api/fdr-sdk";

const API_TYPES_URL_SLUG = "types";
const API_TYPES_TITLE = "Types";
/** Used instead of `types` when a sibling already owns `<api>/types`. */
const API_SCHEMAS_URL_SLUG = "schemas";
const API_SCHEMAS_TITLE = "Schemas";

export interface ApiTypesSection {
    slug: string;
    title: string;
}

/**
 * Picks the url segment and title of the standalone types section: `types`/"Types", unless a sibling of
 * the section (the GraphQL types section, a package named "Types") already has that slug, then
 * `schemas`/"Schemas", then `types-2`, `types-3`, ... (titled "Types") so the section never shares a URL
 * with a sibling.
 */
export function pickApiTypesSection(
    parentSlug: FernNavigation.V1.SlugGenerator,
    siblingSlugs: ReadonlySet<string>
): ApiTypesSection {
    const isFree = (segment: string): boolean => !siblingSlugs.has(parentSlug.append(segment).get());
    if (isFree(API_TYPES_URL_SLUG)) {
        return { slug: API_TYPES_URL_SLUG, title: API_TYPES_TITLE };
    }
    if (isFree(API_SCHEMAS_URL_SLUG)) {
        return { slug: API_SCHEMAS_URL_SLUG, title: API_SCHEMAS_TITLE };
    }
    let n = 2;
    while (!isFree(`${API_TYPES_URL_SLUG}-${n}`)) {
        n++;
    }
    return { slug: `${API_TYPES_URL_SLUG}-${n}`, title: API_TYPES_TITLE };
}
