import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { ResolvedType } from "../../resolvers/ResolvedType";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getRequestProperty, getResponsePropertyComponents } from "./convertResponseProperties";

export type PaginationPropertyComponents = CursorPaginationPropertyComponents | OffsetPaginationPropertyComponents;

export interface CursorPaginationPropertyComponents {
    type: "cursor";
    cursor: string;
    next_cursor: string[];
    results: string[];
}

export interface OffsetPaginationPropertyComponents {
    type: "offset";
    offset: string;
    results: string[];
}

export function getPaginationPropertyComponents(
    endpointPagination: RawSchemas.PaginationSchema
): PaginationPropertyComponents {
    if (isRawOffsetPaginationSchema(endpointPagination)) {
        return {
            type: "offset",
            offset: getRequestProperty(endpointPagination.offset),
            results: getResponsePropertyComponents(endpointPagination.results)
        };
    }
    return {
        type: "cursor",
        cursor: getRequestProperty(endpointPagination.cursor),
        next_cursor: getResponsePropertyComponents(endpointPagination.next_cursor),
        results: getResponsePropertyComponents(endpointPagination.results)
    };
}

export function resolveResponseType({
    endpoint,
    typeResolver,
    file
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): ResolvedType {
    return typeResolver.resolveTypeOrThrow({
        type: (typeof endpoint.response !== "string" ? endpoint.response?.type : endpoint.response) ?? "",
        file
    });
}

function isRawOffsetPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.OffsetPaginationSchema {
    return (
        (rawPaginationSchema as RawSchemas.OffsetPaginationSchema).offset != null &&
        (rawPaginationSchema as RawSchemas.OffsetPaginationSchema).results != null
    );
}
