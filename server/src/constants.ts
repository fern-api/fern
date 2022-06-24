export const ServerConstants = {
    Express: {
        DEFAULT_IMPORT: "express",
        EXPRESS_TYPE: "Express",

        StaticMethods: {
            JSON_MIDDLEWARE: "json",
        },

        AppMethods: {
            USE: "use",
        },

        RequestProperties: {
            PARAMS: "params",
            QUERY_PARAMS: "query",
            BODY: "body",
        },

        ResponseMethods: {
            STATUS: "status",
            SEND: "send",
            SEND_STATUS: "sendStatus",
            END: "end",
        },
    },

    Middleware: {
        FUNCTION_NAME: "expressMiddleware",
        APP_VARIABLE_NAME: "app",
        PARAMETER_NAME: "impl",

        EndpointImplementation: {
            Request: {
                PARAMETER_NAME: "request",
            },
            Response: {
                PARAMETER_NAME: "response",
            },
            ImplResult: {
                VARIABLE_NAME: "result",
            },
        },
    },
} as const;
