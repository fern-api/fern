import { HttpError, Schema } from "@fern-api/openapi-ir-sdk";
import { convertSchema } from "../../../schema/convertSchemas";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { ErrorBodyCollector } from "../ErrorBodyCollector";

export const ERROR_NAMES_BY_STATUS_CODE: Record<number, string> = {
    400: "BadRequestError",
    401: "UnauthorizedError",
    402: "PaymentRequiredError", // not extensively used
    403: "ForbiddenError",
    404: "NotFoundError",
    405: "MethodNotAllowedError",
    406: "NotAcceptableError",
    407: "ProxyAuthenticationRequiredError",
    408: "RequestTimeoutError",
    409: "ConflictError",
    410: "GoneError",
    411: "LengthRequiredError",
    412: "PreconditionFailedError",
    413: "ContentTooLargeError",
    414: "URITooLongError",
    415: "UnsupportedMediaTypeError",
    416: "RangeNotSatisfiableError",
    417: "ExpectationFailedError",
    418: "ImATeapotError",
    419: "AuthenticationTimeoutError", // non-standard
    420: "MethodFailureError", // non-standard
    421: "MisdirectedRequestError",
    422: "UnprocessableEntityError",
    423: "LockedError",
    424: "FailedDependencyError",
    425: "TooEarlyError",
    426: "UpgradeRequiredError",
    // TODO: 428 should be PreconditionRequiredError
    428: "PreconditionError",
    429: "TooManyRequestsError",
    430: "RequestHeaderFieldsTooLargeError", // non-standard, officially reassigned to 431
    431: "RequestHeaderFieldsTooLargeError",
    444: "NoResponseError",
    449: "RetryWithError", // non-standard
    450: "BlockedByWindowsParentalControlsError", // non-standard
    451: "UnavailableForLegalReasonsError", // non-standard
    499: "ClientClosedRequestError", // non-standard
    500: "InternalServerError",
    501: "NotImplementedError"
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
            description: undefined,
            examples: undefined
        };
    }
    return {
        generatedName: errorName,
        nameOverride: undefined,
        schema: Schema.unknown({ nameOverride: undefined, generatedName: errorName }),
        description: undefined,
        examples: undefined
    };
}
