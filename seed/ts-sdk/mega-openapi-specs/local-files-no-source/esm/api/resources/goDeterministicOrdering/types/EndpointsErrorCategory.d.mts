export declare const EndpointsErrorCategory: {
    readonly ApiError: "API_ERROR";
    readonly AuthenticationError: "AUTHENTICATION_ERROR";
    readonly InvalidRequestError: "INVALID_REQUEST_ERROR";
};
export type EndpointsErrorCategory = (typeof EndpointsErrorCategory)[keyof typeof EndpointsErrorCategory];
