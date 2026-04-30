export declare const ErrorCategory: {
    readonly ApiError: "API_ERROR";
    readonly AuthenticationError: "AUTHENTICATION_ERROR";
    readonly InvalidRequestError: "INVALID_REQUEST_ERROR";
};
export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];
