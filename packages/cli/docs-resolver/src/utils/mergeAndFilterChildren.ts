import { FernNavigation } from "@fern-api/fdr-sdk";

import { mergeEndpointPairs } from "./mergeEndpointPairs";

export function mergeAndFilterChildren<EndpointType extends { method: string }>({
    left,
    right,
    findEndpointById,
    stringifyEndpointPathParts,
    disableEndpointPairs,
    apiDefinitionId
}: {
    left: FernNavigation.V1.ApiPackageChild[];
    right: FernNavigation.V1.ApiPackageChild[];
    findEndpointById: (endpointId: FernNavigation.EndpointId) => EndpointType | undefined;
    stringifyEndpointPathParts: (endpoint: EndpointType) => string;
    disableEndpointPairs: boolean;
    apiDefinitionId: FernNavigation.V1.ApiDefinitionId;
}): FernNavigation.V1.ApiPackageChild[] {
    return mergeEndpointPairs({
        children: [...left, ...right],
        findEndpointById,
        stringifyEndpointPathParts,
        disableEndpointPairs,
        apiDefinitionId
    }).filter((child) =>
        // Keep apiPackage if it has children OR if it has an overviewPageId (e.g., tag description page)
        child.type === "apiPackage" ? child.children.length > 0 || child.overviewPageId != null : true
    );
}
