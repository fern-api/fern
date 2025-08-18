import { Pagination } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

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

    export interface CustomPaginationExtensionSchema {
        type: "custom";
        results: string;
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
    throw new Error("Invalid pagination extension");
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
            throw new Error(
                "Global pagination extension is a boolean, expected an object. Only endpoints may declare a boolean for x-fern-pagination."
            );
        }
        return topLevelPagination == null ? undefined : convertPaginationExtension(topLevelPagination);
    }
    return convertPaginationExtension(pagination);
}
