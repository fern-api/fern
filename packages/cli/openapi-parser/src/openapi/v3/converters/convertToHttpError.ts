import { HttpError, Schema } from "@fern-api/openapi-ir-sdk";
import { convertSchema } from "../../../schema/convertSchemas";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { ErrorBodyCollector } from "../ErrorBodyCollector";

export const ERROR_NAMES_BY_STATUS_CODE: Record<number, string> = {
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
    503: "ServiceUnavailableError"
};

export const ERROR_NAMES = new Set<string>(Object.values(ERROR_NAMES_BY_STATUS_CODE));

export function convertToError({
    statusCode,
    errorBodyCollector,
    context
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
            nameOverride: undefined,
            schema,
            description: undefined
        };
    }
    return {
        generatedName: errorName,
        nameOverride: undefined,
        schema: Schema.unknown({ nameOverride: undefined, generatedName: errorName }),
        description: undefined
    };
}
