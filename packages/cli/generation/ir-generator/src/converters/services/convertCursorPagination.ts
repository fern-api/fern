import { Pagination } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { CursorPaginationPropertyComponents } from "./convertPaginationUtils";
import { convertQueryParameter } from "./convertQueryParameter";

export async function convertCursorPagination({
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
}): Promise<Pagination | undefined> {
    const queryParameterSchema =
        typeof endpointSchema.request !== "string" && endpointSchema.request?.["query-parameters"] != null
            ? endpointSchema?.request?.["query-parameters"]?.[paginationPropertyComponents.cursor]
            : undefined;
    if (queryParameterSchema == null) {
        return undefined;
    }
    return Pagination.cursor({
        page: await convertQueryParameter({
            file,
            queryParameterKey: paginationPropertyComponents.cursor,
            queryParameter: queryParameterSchema
        }),
        next: await propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.next_cursor
        }),
        results: await propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        })
    });
}
