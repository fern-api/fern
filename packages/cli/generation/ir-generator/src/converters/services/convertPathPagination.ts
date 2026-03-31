import { Pagination } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext.js";
import { PropertyResolver } from "../../resolvers/PropertyResolver.js";
import { PathPaginationPropertyComponents } from "./convertPaginationUtils.js";

export function convertPathPagination({
    propertyResolver,
    file,
    endpointName,
    paginationPropertyComponents
}: {
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    endpointName: string;
    paginationPropertyComponents: PathPaginationPropertyComponents;
}): Pagination | undefined {
    return Pagination.path({
        nextPath: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.nextPath
        }),
        results: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        })
    });
}
