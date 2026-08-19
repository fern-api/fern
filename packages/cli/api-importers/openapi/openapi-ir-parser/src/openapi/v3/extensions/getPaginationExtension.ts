import { Pagination } from "@fern-api/openapi-ir";
import { CliError } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

declare namespace Raw {
    export type PaginationExtensionSchema =
        | boolean
        | CursorPaginationExtensionSchema
        | OffsetPaginationExtensionSchema
        | UriPaginationExtensionSchema
        | PathPaginationExtensionSchema;

    export interface CursorPaginationExtensionSchema {
        cursor: string;
        next_cursor: string;
        results: string;
    }

    export interface OffsetPaginationExtensionSchema {
        offset: string;
        results: string;
        step: string | undefined;
        "has-next-page": string | undefined;
    }

    export interface UriPaginationExtensionSchema {
        next_uri: string;
        results: string;
    }

    export interface PathPaginationExtensionSchema {
        next_path: string;
        results: string;
    }

    export interface CustomPaginationExtensionSchema {
        type: "custom";
        results: string;
    }
}

export function convertPaginationExtension(
    pagination:
        | Raw.CursorPaginationExtensionSchema
        | Raw.OffsetPaginationExtensionSchema
        | Raw.UriPaginationExtensionSchema
        | Raw.PathPaginationExtensionSchema
): Pagination {
    const maybeCursorPagination = pagination as Raw.CursorPaginationExtensionSchema;
    if (maybeCursorPagination.cursor != null) {
        return Pagination.cursor({
            cursor: maybeCursorPagination.cursor,
            nextCursor: maybeCursorPagination.next_cursor,
            results: maybeCursorPagination.results
        });
    }

    const maybeUriPagination = pagination as Raw.UriPaginationExtensionSchema;
    if ("next_uri" in maybeUriPagination) {
        return Pagination.uri({
            nextUri: maybeUriPagination.next_uri,
            results: maybeUriPagination.results
        });
    }

    const maybePathPagination = pagination as Raw.PathPaginationExtensionSchema;
    if ("next_path" in maybePathPagination) {
        return Pagination.path({
            nextPath: maybePathPagination.next_path,
            results: maybePathPagination.results
        });
    }

    if ("offset" in pagination) {
        const offsetPagination = pagination as Raw.OffsetPaginationExtensionSchema;
        return Pagination.offset({
            offset: offsetPagination.offset,
            results: offsetPagination.results,
            step: offsetPagination.step,
            hasNextPage: offsetPagination["has-next-page"]
        });
    }
    if ("type" in pagination && pagination.type === "custom") {
        const customPagination = pagination as Raw.CustomPaginationExtensionSchema;
        return Pagination.custom({
            results: customPagination.results
        });
    }
    throw new CliError({ message: "Invalid pagination extension", code: CliError.Code.ValidationError });
}

export function getFernPaginationExtension(
    document: OpenAPIV3.Document,
    operation: OpenAPIV3.OperationObject
): Pagination | undefined {
    const pagination = getExtension<Raw.PaginationExtensionSchema>(operation, FernOpenAPIExtension.PAGINATION);
    if (pagination == null) {
        return undefined;
    }
    if (typeof pagination === "boolean") {
        // The endpoint is trying to leverage the global config, grab extension from global
        const topLevelPagination = getExtension<Raw.PaginationExtensionSchema>(
            document,
            FernOpenAPIExtension.PAGINATION
        );
        if (typeof topLevelPagination === "boolean") {
            throw new CliError({
                message:
                    "Global pagination extension is a boolean, expected an object. Only endpoints may declare a boolean for x-fern-pagination.",
                code: CliError.Code.ValidationError
            });
        }
        return topLevelPagination == null ? undefined : convertPaginationExtension(topLevelPagination);
    }
    return convertPaginationExtension(pagination);
}
