import { RawSchemas } from "@fern-api/fern-definition-schema";

import { FernFileContext } from "../../FernFileContext";
import { ResolvedType } from "../../resolvers/ResolvedType";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getRequestPropertyComponents, getResponsePropertyComponents } from "./convertProperty";

export type PaginationPropertyComponents =
    | CursorPaginationPropertyComponents
    | OffsetPaginationPropertyComponents
    | CustomPaginationPropertyComponents;

export interface CursorPaginationPropertyComponents {
    type: "cursor";
    cursor: string[];
    next_cursor: string[];
    results: string[];
}

export interface OffsetPaginationPropertyComponents {
    type: "offset";
    offset: string[];
    results: string[];
    step: string[] | undefined;
    hasNextPage: string[] | undefined;
    perPage: string[] | undefined;
}

export interface CustomPaginationPropertyComponents {
    type: "custom";
    results: string[];
}

export function getPaginationPropertyComponents(
    endpointPagination: RawSchemas.PaginationSchema
): PaginationPropertyComponents {
    if (isRawOffsetPaginationSchema(endpointPagination)) {
        return {
            type: "offset",
            offset: getRequestPropertyComponents(endpointPagination.offset),
            results: getResponsePropertyComponents(endpointPagination.results),
            step: endpointPagination.step != null ? getRequestPropertyComponents(endpointPagination.step) : undefined,
            hasNextPage:
                endpointPagination["has-next-page"] != null
                    ? getResponsePropertyComponents(endpointPagination["has-next-page"])
                    : undefined,
            perPage:
                endpointPagination["per-page"] != null
                    ? getRequestPropertyComponents(endpointPagination["per-page"])
                    : undefined
        };
    } else if (isRawCursorPaginationSchema(endpointPagination)) {
        return {
            type: "cursor",
            cursor: getRequestPropertyComponents(endpointPagination.cursor),
            next_cursor: getResponsePropertyComponents(endpointPagination.next_cursor),
            results: getResponsePropertyComponents(endpointPagination.results)
        };
    } else if (isRawCustomPaginationSchema(endpointPagination)) {
        return {
            type: "custom",
            results: getResponsePropertyComponents(endpointPagination.results)
        };
    }
    throw new Error("Invalid pagination schema");
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

function isRawCursorPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.CursorPaginationSchema {
    return (rawPaginationSchema as RawSchemas.CursorPaginationSchema).cursor != null;
}

function isRawOffsetPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.OffsetPaginationSchema {
    return (
        (rawPaginationSchema as RawSchemas.OffsetPaginationSchema).offset != null &&
        (rawPaginationSchema as RawSchemas.OffsetPaginationSchema).results != null
    );
}

function isRawCustomPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.CustomPaginationSchema {
    return "type" in rawPaginationSchema && rawPaginationSchema.type === "custom";
}
