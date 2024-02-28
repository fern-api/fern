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
    page: string;
    next: string;
    results: string;
}

export interface FernOffsetPaginationExtension {
    type: "offset";
    page: string;
    results: string;
}

declare namespace Raw {
    export type PaginationExtensionSchema = boolean | CursorPaginationExtensionSchema | OffsetPaginationExtensionSchema;

    export interface CursorPaginationExtensionSchema {
        type: "cursor";
        page: string;
        next: string;
        results: string;
    }

    export interface OffsetPaginationExtensionSchema {
        type: "offset";
        page: string;
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
    if (pagination.type === "cursor") {
        return {
            type: "cursor",
            page: pagination.page,
            next: pagination.next,
            results: pagination.results
        };
    }
    return {
        type: "offset",
        page: pagination.page,
        results: pagination.results
    };
}
