import { OpenAPIV3 } from "openapi-types";

import { Pagination } from "@fern-api/openapi-ir";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

declare namespace Raw {
    export type PaginationExtensionSchema = boolean | CursorPaginationExtensionSchema | OffsetPaginationExtensionSchema;

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
}

export function convertPaginationExtension(
    pagination: Raw.CursorPaginationExtensionSchema | Raw.OffsetPaginationExtensionSchema
): Pagination {
    const maybeCursorPagination = pagination as Raw.CursorPaginationExtensionSchema;
    if (maybeCursorPagination.cursor != null) {
        return Pagination.cursor({
            cursor: maybeCursorPagination.cursor,
            nextCursor: maybeCursorPagination.next_cursor,
            results: maybeCursorPagination.results
        });
    }

    const maybeOffsetPagination = pagination as Raw.OffsetPaginationExtensionSchema;
    return Pagination.offset({
        offset: maybeOffsetPagination.offset,
        results: maybeOffsetPagination.results,
        step: maybeOffsetPagination.step,
        hasNextPage: maybeOffsetPagination["has-next-page"]
    });
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
        // The endpoint is tryning to leverage the gloabl config, grab extension from global
        const topLevelPagination = getExtension<Raw.PaginationExtensionSchema>(
            document,
            FernOpenAPIExtension.PAGINATION
        );
        if (typeof topLevelPagination === "boolean") {
            throw new Error(
                "Global pagination extension is a boolean, expected an object. Only endpoints may declare a boolean for x-fern-pagination."
            );
        }
        return topLevelPagination == null ? undefined : convertPaginationExtension(topLevelPagination);
    }
    return convertPaginationExtension(pagination);
}
