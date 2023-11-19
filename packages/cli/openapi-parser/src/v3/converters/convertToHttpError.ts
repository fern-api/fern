import { HttpError, Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { ErrorBodyCollector } from "../ErrorBodyCollector";
import { convertSchema } from "./convertSchemas";

const ERROR_NAMES_BY_STATUS_CODE: Record<number, string> = {
    400: "BadRequestError",
    401: "UnauthorizedError",
    403: "ForbiddenError",
    404: "NotFoundError",
    408: "RequestTimeoutError",
    409: "ConflictError",
    413: "ContentTooLargeError",
    422: "UnprocessableEntityError",
    428: "PreconditionError",
    429: "TooManyRequestsError",
    500: "InternalServerError",
    501: "NotImplementedError",
    503: "ServiceUnavailableError",
};

export function convertToError({
    statusCode,
    errorBodyCollector,
    context,
}: {
    statusCode: number;
    errorBodyCollector: ErrorBodyCollector;
    context: AbstractOpenAPIV3ParserContext;
}): HttpError | undefined {
    const errorName = ERROR_NAMES_BY_STATUS_CODE[statusCode];
    if (errorName == null) {
        return undefined;
    }
    const schemas = errorBodyCollector.getSchemas();

    if (schemas.length === 1 && schemas[0] != null) {
        const schema = convertSchema(schemas[0], false, context, [errorName, "Body"]);
        return {
            generatedName: errorName,
            nameOverride: null,
            schema,
            description: undefined,
        };
    }
    return {
        generatedName: errorName,
        nameOverride: null,
        schema: Schema.unknown(),
        description: undefined,
    };
}
