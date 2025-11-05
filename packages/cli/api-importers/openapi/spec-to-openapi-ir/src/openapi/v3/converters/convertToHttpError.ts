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
    498: "InvalidTokenError", // non-standard
    499: "ClientClosedRequestError", // non-standard
    500: "InternalServerError",
    501: "NotImplementedError",
    502: "BadGatewayError",
    503: "ServiceUnavailableError",
    504: "GatewayTimeoutError",
    505: "HTTPVersionNotSupportedError",
    506: "VariantAlsoNegotiatesError",
    507: "InsufficientStorageError",
    508: "LoopDetectedError",
    509: "BandwidthLimitExceededError",
    510: "NotExtendedError",
    511: "NetworkAuthenticationRequiredError"
};

export const ERROR_NAMES = new Set<string>(Object.values(ERROR_NAMES_BY_STATUS_CODE));
