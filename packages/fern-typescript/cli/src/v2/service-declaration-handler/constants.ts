export const ClientConstants = {
    HttpService: {
        SERVICE_NAME: "Client",

        Files: {
            ENDPOINTS_DIRECTORY_NAME: "endpoints",
        },
        ServiceNamespace: {
            Init: {
                TYPE_NAME: "Init",
                Properties: {
                    BASE_PATH: "basePath",
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
