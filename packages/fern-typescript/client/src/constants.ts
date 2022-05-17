export const ClientConstants = {
    Files: {
        ENDPOINTS_DIRECTORY_NAME: "endpoints",
    },
    Service: {
        NamespaceImports: {
            ENDPOINTS: "endpoints",
            ENCODERS: "encoders",
        },
        ServiceUtils: {
            Imported: {
                FETCHER_TYPE_NAME: "Fetcher",
                DEFAULT_FETCHER: "defaultFetcher",
                SERVICE_NAMESPACE: "Service",
                IS_RESPONSE_OK_FUNCTION: "isResponseOk",
            },
            ServiceInit: {
                TYPE_NAME: "Init",

                Properties: {
                    FETCHER: "fetcher",
                    SERVER_URL: "serverUrl",
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
                        STATUS_CODE: "statusCode",
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
        },
    },
};
