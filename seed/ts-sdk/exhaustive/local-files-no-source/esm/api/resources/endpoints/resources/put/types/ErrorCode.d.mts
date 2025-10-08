export declare const ErrorCode: {
    readonly InternalServerError: "INTERNAL_SERVER_ERROR";
    readonly Unauthorized: "UNAUTHORIZED";
    readonly Forbidden: "FORBIDDEN";
    readonly BadRequest: "BAD_REQUEST";
    readonly Conflict: "CONFLICT";
    readonly Gone: "GONE";
    readonly UnprocessableEntity: "UNPROCESSABLE_ENTITY";
    readonly NotImplemented: "NOT_IMPLEMENTED";
    readonly BadGateway: "BAD_GATEWAY";
    readonly ServiceUnavailable: "SERVICE_UNAVAILABLE";
    readonly Unknown: "Unknown";
};
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
