import { RawSchemas } from "@fern-api/fern-definition-schema";
import { CliError } from "@fern-api/task-context";
import { FernFileContext } from "../../FernFileContext.js";
import { ResolvedType } from "../../resolvers/ResolvedType.js";
import { TypeResolver } from "../../resolvers/TypeResolver.js";
import { getRequestPropertyComponents, getResponsePropertyComponents } from "./convertProperty.js";

export type PaginationPropertyComponents =
    | CursorPaginationPropertyComponents
    | OffsetPaginationPropertyComponents
    | CustomPaginationPropertyComponents
    | UriPaginationPropertyComponents
    | PathPaginationPropertyComponents;

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
}

export interface CustomPaginationPropertyComponents {
    type: "custom";
    results: string[];
}

export interface UriPaginationPropertyComponents {
    type: "uri";
    nextUri: string[];
    results: string[];
}

export interface PathPaginationPropertyComponents {
    type: "path";
    nextPath: string[];
    results: string[];
}

export function getPaginationPropertyComponents(
    endpointPagination: RawSchemas.PaginationSchema
): PaginationPropertyComponents {
    if (isRawUriPaginationSchema(endpointPagination)) {
        return {
            type: "uri",
            nextUri: getResponsePropertyComponents(endpointPagination.next_uri),
            results: getResponsePropertyComponents(endpointPagination.results)
        };
    } else if (isRawPathPaginationSchema(endpointPagination)) {
        return {
            type: "path",
            nextPath: getResponsePropertyComponents(endpointPagination.next_path),
            results: getResponsePropertyComponents(endpointPagination.results)
        };
    } else if (isRawOffsetPaginationSchema(endpointPagination)) {
        return {
            type: "offset",
            offset: getRequestPropertyComponents(endpointPagination.offset),
            results: getResponsePropertyComponents(endpointPagination.results),
            step: endpointPagination.step != null ? getRequestPropertyComponents(endpointPagination.step) : undefined,
            hasNextPage:
                endpointPagination["has-next-page"] != null
                    ? getResponsePropertyComponents(endpointPagination["has-next-page"])
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
    throw new CliError({ message: "Invalid pagination schema", code: CliError.Code.ValidationError });
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

export function isRawUriPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.UriPaginationSchema {
    return (rawPaginationSchema as RawSchemas.UriPaginationSchema).next_uri != null;
}

export function isRawPathPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.PathPaginationSchema {
    return (rawPaginationSchema as RawSchemas.PathPaginationSchema).next_path != null;
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
