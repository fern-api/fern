import { Pagination } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { OffsetPaginationPropertyComponents } from "./convertPaginationUtils";

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
    return Pagination.offset({
        page: await propertyResolver.resolveRequestPropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.offset
        }),
        results: await propertyResolver.resolveResponsePropertyOrThrow({
            file,
            endpoint: endpointName,
            propertyComponents: paginationPropertyComponents.results
        }),
        step:
            paginationPropertyComponents.step != null
                ? await propertyResolver.resolveRequestPropertyOrThrow({
                      file,
                      endpoint: endpointName,
                      propertyComponents: paginationPropertyComponents.step
                  })
                : undefined
    });
}
