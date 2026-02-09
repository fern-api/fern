import { Pagination } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext.js";
import { PropertyResolver } from "../../resolvers/PropertyResolver.js";
import { CustomPaginationPropertyComponents } from "./convertPaginationUtils.js";

export function convertCustomPagination({
    propertyResolver,
    file,
    endpointName,
    paginationPropertyComponents
}: {
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    endpointName: string;
    paginationPropertyComponents: CustomPaginationPropertyComponents;
}): Pagination | undefined {
    return Pagination.custom({
        results: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        })
    });
}
