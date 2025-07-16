import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Pagination } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { CursorPaginationPropertyComponents } from "./convertPaginationUtils";

export function convertCursorPagination({
    propertyResolver,
    file,
    endpointName,
    endpointSchema,
    paginationPropertyComponents
}: {
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    endpointName: string;
    endpointSchema: RawSchemas.HttpEndpointSchema;
    paginationPropertyComponents: CursorPaginationPropertyComponents;
}): Pagination | undefined {
    return Pagination.cursor({
        page: propertyResolver.resolveRequestPropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.cursor
        }),
        next: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.next_cursor
        }),
        results: propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        })
    });
}
