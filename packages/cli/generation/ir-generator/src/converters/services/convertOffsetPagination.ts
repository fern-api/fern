import { Pagination } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { OffsetPaginationPropertyComponents } from "./convertPaginationUtils";
import { convertQueryParameter } from "./convertQueryParameter";

export async function convertOffsetPagination({
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
    paginationPropertyComponents: OffsetPaginationPropertyComponents;
}): Promise<Pagination | undefined> {
    const queryParameterSchema =
        typeof endpointSchema.request !== "string" && endpointSchema.request?.["query-parameters"] != null
            ? endpointSchema?.request?.["query-parameters"]?.[paginationPropertyComponents.offset]
            : undefined;
    if (queryParameterSchema == null) {
        return undefined;
    }
    return Pagination.offset({
        page: await convertQueryParameter({
            file,
            queryParameterKey: paginationPropertyComponents.offset,
            queryParameter: queryParameterSchema
        }),
        results: await propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        })
    });
}
