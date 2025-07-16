import { kebabCase } from "lodash-es";

import { FernNavigation } from "@fern-api/fdr-sdk";

export function getApiLatestToNavigationNodeUrlSlug<T extends { id: string; operationId?: string }>({
    item,
    parentSlug
}: {
    item: T;
    parentSlug: FernNavigation.V1.SlugGenerator;
}): FernNavigation.V1.Slug {
    return parentSlug.apply({ urlSlug: kebabCase(item.id.split(".").pop() ?? "") }).get();
}
