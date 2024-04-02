import { assertNever } from "@fern-api/core-utils";
import { Pagination } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertCursorPagination } from "./convertCursorPagination";
import { convertOffsetPagination } from "./convertOffsetPagination";
import { getPaginationPropertyComponents } from "./convertPaginationUtils";

export async function convertPagination({
    typeResolver,
    file,
    endpointSchema
}: {
    typeResolver: TypeResolver;
    file: FernFileContext;
    endpointSchema: RawSchemas.HttpEndpointSchema;
}): Promise<Pagination | undefined> {
    const endpointPagination =
        typeof endpointSchema.pagination === "boolean" ? file.rootApiFile.pagination : endpointSchema.pagination;
    if (!endpointPagination) {
        return undefined;
    }
    const paginationPropertyComponents = getPaginationPropertyComponents(endpointPagination);
    switch (paginationPropertyComponents.type) {
        case "cursor":
            return await convertCursorPagination({
                typeResolver,
                file,
                endpointSchema,
                paginationPropertyComponents
            });
        case "offset":
            return convertOffsetPagination({
                typeResolver,
                file,
                endpointSchema,
                paginationPropertyComponents
            });
        default:
            assertNever(paginationPropertyComponents);
    }
}
