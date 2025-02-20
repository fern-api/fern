import { kebabCase } from "lodash-es";

import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";

export function getApiLatestToNavigationNodeUrlSlug<T extends { id: string; operationId?: string }>(
    item: T,
    parentSlug: FernNavigation.V1.SlugGenerator,
    namespacedSlug: FernNavigation.V1.SlugGenerator
): FernNavigation.V1.Slug {
    return item.operationId != null
        ? parentSlug.apply({ urlSlug: kebabCase(item.operationId) }).get()
        : namespacedSlug.apply({ urlSlug: kebabCase(item.id.split(".").pop() ?? "") }).get();
}
