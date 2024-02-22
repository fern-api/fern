import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export interface FernPaginationExtension {
    page: string;
    next: string;
    results: string;
}

declare namespace Raw {
    export interface PaginationExtensionSchema {
        page: string;
        next: string;
        results: string;
    }
}

export function getFernPaginationExtension(operation: OpenAPIV3.OperationObject): FernPaginationExtension | undefined {
    const pagination = getExtension<Raw.PaginationExtensionSchema>(operation, FernOpenAPIExtension.PAGINATION);
    if (pagination == null) {
        return undefined;
    }
    return {
        page: pagination.page,
        next: pagination.next,
        results: pagination.results
    };
}
