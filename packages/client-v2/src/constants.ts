export const ClientConstants = {
    HttpService: {
        SERVICE_NAME: "_Client",

        Files: {
            ENDPOINTS_DIRECTORY_NAME: "endpoints",
        },
        ServiceNamespace: {
            Options: {
                TYPE_NAME: "Options",
                Properties: {
                    BASE_PATH: "_basePath",
                },
            },
        },
        PrivateMembers: {
            OPTIONS: "options",
        },
        Endpoint: {
            Signature: {
                REQUEST_PARAMETER: "request",
            },
            Variables: {
                QUERY_PARAMETERS: "queryParameters",
                RESPONSE: "response",
            },
            Utils: {
                ERROR_PARSER: "Error",
            },
        },
    },
} as const;
