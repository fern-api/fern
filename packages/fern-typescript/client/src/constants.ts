export const ClientConstants = {
    WebsocketChannel: {
        Files: {
            OPERATIONS_DIRECTORY_NAME: "operations",
        },
        Namespace: {
            Args: {
                TYPE_NAME: "Args",
                Properties: {
                    ORIGIN: "origin",
                },
            },
            SERVER_MESSAGE: "ServerMessage",
        },
        Constructor: {
            PARAMETER_NAME: "args",
        },
        PrivateMembers: {
            SOCKET: "socket",
            CALLBACKS: "callbacks",
        },
        Methods: {
            DISCONNECT: "_disconnect",
            ON_MESSAGE: "_onMessage",
        },
        Operation: {
            Signature: {
                REQUEST_PARAMETER: "request",
            },
        },
    },

    HttpService: {
        Files: {
            ENDPOINTS_DIRECTORY_NAME: "endpoints",
        },
        NamespaceImports: {
            ENCODERS: "encoders",
        },
        // TODO this should probably live with the fern service-utils
        // helpers in fern-typescript commons
        ServiceUtils: {
            ServiceInit: {
                Properties: {
                    FETCHER: "fetcher",
                    ORIGIN: "origin",
                    TOKEN: "token",
                },
            },
            Fetcher: {
                Parameters: {
                    URL: "url",
                    METHOD: "method",
                    HEADERS: "headers",
                    QUERY_PARAMS: "queryParameters",
                    TOKEN: "token",

                    Body: {
                        PROPERTY_NAME: "body",

                        Properties: {
                            CONTENT: "content",
                            CONTENT_TYPE: "contentType",
                        },
                    },
                },
                Response: {
                    BODY: "body",
                },
            },
        },
        PrivateMembers: {
            BASE_URL: "baseUrl",
            FETCHER: "fetcher",
            TOKEN: "token",
        },
        Endpoint: {
            Signature: {
                REQUEST_PARAMETER: "request",
            },
            Variables: {
                QUERY_PARAMETERS: "queryParameters",
                ENCODED_RESPONSE: "encodedResponse",
                DECODED_RESPONSE: "response",
                DECODED_ERROR: "error",
            },
        },
    },
} as const;
