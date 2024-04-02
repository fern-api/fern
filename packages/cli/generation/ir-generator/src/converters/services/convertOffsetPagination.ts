import { Pagination } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import {
    getNestedObjectPropertyFromResolvedType,
    maybeFileFromResolvedType,
    OffsetPaginationPropertyComponents,
    resolveResponseType
} from "./convertPaginationUtils";
import { convertQueryParameter } from "./convertQueryParameter";

export async function convertOffsetPagination({
    typeResolver,
    file,
    endpointSchema,
    paginationPropertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
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
    const resolvedResponseType = resolveResponseType({
        typeResolver,
        file,
        endpoint: endpointSchema
    });
    const resultsObjectProperty = await getNestedObjectPropertyFromResolvedType({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
        resolvedType: resolvedResponseType,
        propertyComponents: paginationPropertyComponents.results
    });
    if (resultsObjectProperty == null) {
        return undefined;
    }
    return Pagination.offset({
        page: await convertQueryParameter({
            file,
            queryParameterKey: paginationPropertyComponents.offset,
            queryParameter: queryParameterSchema
        }),
        results: {
            propertyPath: paginationPropertyComponents.results.map((property) =>
                file.casingsGenerator.generateName(property)
            ),
            property: resultsObjectProperty
        }
    });
}
