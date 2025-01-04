import { RawSchemas } from "@fern-api/fern-definition-schema";
import { TypeResolverImpl, constructFernFileContext } from "@fern-api/ir-generator";

import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateCursorPagination } from "./validateCursorPagination";
import { validateOffsetPagination } from "./validateOffsetPagination";

export const ValidPaginationRule: Rule = {
    name: "valid-pagination",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        const defaultPagination = workspace.definition.rootApiFile.contents.pagination;

        return {
            definitionFile: {
                httpEndpoint: ({ endpointId, endpoint }, { relativeFilepath, contents: definitionFile }) => {
                    const endpointPagination =
                        typeof endpoint.pagination === "boolean" ? defaultPagination : endpoint.pagination;
                    if (!endpointPagination) {
                        return [];
                    }

                    const file = constructFernFileContext({
                        relativeFilepath,
                        definitionFile,
                        casingsGenerator: CASINGS_GENERATOR,
                        rootApiFile: workspace.definition.rootApiFile.contents
                    });

                    if (isRawCursorPaginationSchema(endpointPagination)) {
                        return validateCursorPagination({
                            endpointId,
                            endpoint,
                            typeResolver,
                            file,
                            cursorPagination: endpointPagination
                        });
                    }
                    return validateOffsetPagination({
                        endpointId,
                        endpoint,
                        typeResolver,
                        file,
                        offsetPagination: endpointPagination
                    });
                }
            }
        };
    }
};

function isRawCursorPaginationSchema(
    rawPaginationSchema: RawSchemas.PaginationSchema
): rawPaginationSchema is RawSchemas.CursorPaginationSchema {
    return (
        (rawPaginationSchema as RawSchemas.CursorPaginationSchema).cursor != null &&
        (rawPaginationSchema as RawSchemas.CursorPaginationSchema).next_cursor != null &&
        (rawPaginationSchema as RawSchemas.CursorPaginationSchema).results != null
    );
}
