export const ClientConstants = {
    WebsocketChannel: {
        CLIENT_NAME: "Client",

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
        CLIENT_NAME: "Client",

        Files: {
            ENDPOINTS_DIRECTORY_NAME: "endpoints",
        },
        NamespaceImports: {
            ENCODERS: "encoders",
        },
        ServiceUtils: {
            Imported: {
                FETCHER_TYPE_NAME: "Fetcher",
                DEFAULT_FETCHER: "defaultFetcher",
                SERVICE_NAMESPACE: "Service",
                IS_RESPONSE_OK_FUNCTION: "isResponseOk",
                TOKEN_TYPE_NAME: "Token",
            },
            ServiceInit: {
                TYPE_NAME: "Init",

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
                    STATUS_CODE: "statusCode",
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
            Types: {
                Response: {
                    Properties: {
                        STATUS_CODE: "statusCode",
                    },
                },
            },
        },
    },
} as const;
