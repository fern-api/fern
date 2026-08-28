import { Pagination } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext.js";
import { PropertyResolver } from "../../resolvers/PropertyResolver.js";
import { ItemCursorPaginationPropertyComponents } from "./convertPaginationUtils.js";

export function convertItemCursorPagination({
    propertyResolver,
    file,
    endpointName,
    paginationPropertyComponents
}: {
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    endpointName: string;
    paginationPropertyComponents: ItemCursorPaginationPropertyComponents;
}): Pagination {
    return Pagination.itemCursor({
        page: propertyResolver.resolveRequestPropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.cursor
        }),
        results: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        }),
        itemCursor: propertyResolver.resolveResponseItemPropertyOrThrow({
            file,
            endpoint: endpointName,
            listPropertyComponents: paginationPropertyComponents.results,
            itemPropertyComponents: paginationPropertyComponents.itemCursor
        }),
        element: paginationPropertyComponents.element
    });
}
