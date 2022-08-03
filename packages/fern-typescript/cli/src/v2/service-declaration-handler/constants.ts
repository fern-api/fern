export const ClientConstants = {
    HttpService: {
        Files: {
            ENDPOINTS_DIRECTORY_NAME: "endpoints",
        },
        ServiceNamespace: {
            Init: {
                TYPE_NAME: "Init",
                Properties: {
                    ORIGIN: "origin",
                },
            },
        },
        PrivateMembers: {
            BASE_URL: "baseUrl",
        },
        Endpoint: {
            Signature: {
                REQUEST_PARAMETER: "request",
            },
            Variables: {
                QUERY_PARAMETERS: "queryParameters",
                RESPONSE: "response",
            },
        },
    },
} as const;
