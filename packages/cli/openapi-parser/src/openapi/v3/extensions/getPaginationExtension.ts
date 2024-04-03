import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export type FernPaginationExtension =
    | FernPaginationEnabledExtension
    | FernCursorPaginationExtension
    | FernOffsetPaginationExtension;

export interface FernPaginationEnabledExtension {
    type: "pagination";
}

export interface FernCursorPaginationExtension {
    type: "cursor";
    cursor: string;
    next_cursor: string;
    results: string;
}

export interface FernOffsetPaginationExtension {
    type: "offset";
    offset: string;
    results: string;
}

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
    }
}

export function getFernPaginationExtension(
    node: OpenAPIV3.Document | OpenAPIV3.OperationObject
): FernPaginationExtension | undefined {
    const pagination = getExtension<Raw.PaginationExtensionSchema>(node, FernOpenAPIExtension.PAGINATION);
    if (pagination == null) {
        return undefined;
    }
    if (typeof pagination === "boolean") {
        return pagination
            ? {
                  type: "pagination"
              }
            : undefined;
    }
    if (isRawCursorPaginationSchema(pagination)) {
        return {
            type: "cursor",
            cursor: pagination.cursor,
            next_cursor: pagination.next_cursor,
            results: pagination.results
        };
    }
    return {
        type: "offset",
        offset: pagination.offset,
        results: pagination.results
    };
}

function isRawCursorPaginationSchema(
    rawPaginationSchema: Raw.PaginationExtensionSchema
): rawPaginationSchema is Raw.CursorPaginationExtensionSchema {
    return (
        (rawPaginationSchema as Raw.CursorPaginationExtensionSchema).cursor != null &&
        (rawPaginationSchema as Raw.CursorPaginationExtensionSchema).next_cursor != null &&
        (rawPaginationSchema as Raw.CursorPaginationExtensionSchema).results != null
    );
}
