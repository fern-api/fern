import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Pagination } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext.js";
import { PropertyResolver } from "../../resolvers/PropertyResolver.js";
import { convertCursorPagination } from "./convertCursorPagination.js";
import { convertCustomPagination } from "./convertCustomPagination.js";
import { convertOffsetPagination } from "./convertOffsetPagination.js";
import { getPaginationPropertyComponents } from "./convertPaginationUtils.js";

export function convertPagination({
    propertyResolver,
    file,
    endpointName,
    endpointSchema
}: {
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    endpointName: string;
    endpointSchema: RawSchemas.HttpEndpointSchema;
}): Pagination | undefined {
    const endpointPagination =
        typeof endpointSchema.pagination === "boolean" ? file.rootApiFile.pagination : endpointSchema.pagination;
    if (!endpointPagination) {
        return undefined;
    }
    const paginationPropertyComponents = getPaginationPropertyComponents(endpointPagination);
    switch (paginationPropertyComponents.type) {
        case "cursor":
            return convertCursorPagination({
                propertyResolver,
                file,
                endpointName,
                endpointSchema,
                paginationPropertyComponents
            });
        case "offset":
            return convertOffsetPagination({
                propertyResolver,
                file,
                endpointName,
                endpointSchema,
                paginationPropertyComponents
            });
        case "custom":
            return convertCustomPagination({
                propertyResolver,
                file,
                endpointName,
                paginationPropertyComponents
            });
        default:
            assertNever(paginationPropertyComponents);
    }
}
