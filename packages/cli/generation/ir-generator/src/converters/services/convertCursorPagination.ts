import { Pagination } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import {
    CursorPaginationPropertyComponents,
    getNestedObjectPropertyFromResolvedType,
    maybeFileFromResolvedType,
    resolveResponseType
} from "./convertPaginationUtils";
import { convertQueryParameter } from "./convertQueryParameter";

export async function convertCursorPagination({
    typeResolver,
    file,
    endpointSchema,
    paginationPropertyComponents
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
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
    const resolvedResponseType = resolveResponseType({
        typeResolver,
        file,
        endpoint: endpointSchema
    });
    const nextCursorObjectProperty = await getNestedObjectPropertyFromResolvedType({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
        resolvedType: resolvedResponseType,
        propertyComponents: paginationPropertyComponents.next_cursor
    });
    if (nextCursorObjectProperty == null) {
        return undefined;
    }
    const resultsObjectProperty = await getNestedObjectPropertyFromResolvedType({
        typeResolver,
        file: maybeFileFromResolvedType(resolvedResponseType) ?? file,
        resolvedType: resolvedResponseType,
        propertyComponents: paginationPropertyComponents.results
    });
    if (resultsObjectProperty == null) {
        return undefined;
    }
    return Pagination.cursor({
        page: await convertQueryParameter({
            file,
            queryParameterKey: paginationPropertyComponents.cursor,
            queryParameter: queryParameterSchema
        }),
        next: {
            propertyPath: paginationPropertyComponents.next_cursor.map((property) =>
                file.casingsGenerator.generateName(property)
            ),
            property: nextCursorObjectProperty
        },
        results: {
            propertyPath: paginationPropertyComponents.results.map((property) =>
                file.casingsGenerator.generateName(property)
            ),
            property: resultsObjectProperty
        }
    });
}
