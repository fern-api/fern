import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Pagination } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { CustomPaginationPropertyComponents } from "./convertPaginationUtils";

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
