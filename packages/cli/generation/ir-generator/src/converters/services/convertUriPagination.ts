import { Pagination } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext.js";
import { PropertyResolver } from "../../resolvers/PropertyResolver.js";
import { UriPaginationPropertyComponents } from "./convertPaginationUtils.js";

export function convertUriPagination({
    propertyResolver,
    file,
    endpointName,
    paginationPropertyComponents
}: {
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    endpointName: string;
    paginationPropertyComponents: UriPaginationPropertyComponents;
}): Pagination | undefined {
    return Pagination.uri({
        nextUri: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.nextUri
        }),
        results: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        })
    });
}
