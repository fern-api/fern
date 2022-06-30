export const ServiceTypesConstants = {
    Commons: {
        Request: {
            TYPE_NAME: "Request",

            Properties: {
                Body: {
                    PROPERTY_NAME: "body",
                    TYPE_NAME: "RequestBody",
                },
            },
        },
        Response: {
            TYPE_NAME: "Response",

            Properties: {
                OK: "ok",
            },

            Success: {
                TYPE_NAME: "SuccessResponse",

                Properties: {
                    Body: {
                        PROPERTY_NAME: "body",
                        TYPE_NAME: "ResponseBody",
                    },
                },
            },

            Error: {
                TYPE_NAME: "ErrorResponse",

                Properties: {
                    Body: {
                        PROPERTY_NAME: "error",
                        TYPE_NAME: "ErrorBody",
                    },
                },
            },
        },
    },

    HttpEndpint: {
        Token: {
            VARIABLE_NAME: "token",
        },
        Request: {
            VARIABLE_NAME: "request",
        },
    },

    WebsocketChannel: {
        Request: {
            Properties: {
                ID: "id",
                OPERATION: "operation",
            },
        },
        Response: {
            Properties: {
                ID: "id",
                REPLY_TO: "replyTo",
            },
        },
    },
} as const;
