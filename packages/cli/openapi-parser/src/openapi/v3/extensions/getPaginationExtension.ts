import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export type FernPaginationExtension = FernPaginationEnabledExtension | FernPaginationConfigExtension;

export interface FernPaginationEnabledExtension {
    type: "pagination";
}

export interface FernPaginationConfigExtension {
    type: "paginationConfig";
    page: string;
    next: string;
    results: string;
}

declare namespace Raw {
    export type PaginationExtensionSchema = boolean | PaginationExtensionObjectSchema;

    export interface PaginationExtensionObjectSchema {
        page: string;
        next: string;
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

    return {
        type: "paginationConfig",
        page: pagination.page,
        next: pagination.next,
        results: pagination.results
    };
}
