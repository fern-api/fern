export const MOCK_IR_V2 = {
    apiName: "test",
    auth: {
        requirement: "ALL",
        schemes: [],
    },
    headers: [],
    types: [],
    errors: [
        {
            name: {
                name: "BlogNotFoundError",
                nameV2: {
                    originalValue: "BlogNotFoundError",
                    camelCase: "blogNotFoundError",
                    snakeCase: "blog_not_found_error",
                    pascalCase: "BlogNotFoundError",
                    screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
                },
                nameV3: {
                    unsafeName: {
                        originalValue: "BlogNotFoundError",
                        camelCase: "blogNotFoundError",
                        snakeCase: "blog_not_found_error",
                        pascalCase: "BlogNotFoundError",
                        screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
                    },
                    safeName: {
                        originalValue: "BlogNotFoundError",
                        camelCase: "blogNotFoundError",
                        snakeCase: "blog_not_found_error",
                        pascalCase: "BlogNotFoundError",
                        screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
                    },
                },
                fernFilepath: [
                    {
                        originalValue: "blog",
                        camelCase: "blog",
                        snakeCase: "blog",
                        pascalCase: "Blog",
                        screamingSnakeCase: "BLOG",
                    },
                ],
                fernFilepathV2: [
                    {
                        unsafeName: {
                            originalValue: "blog",
                            camelCase: "blog",
                            snakeCase: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                        },
                        safeName: {
                            originalValue: "blog",
                            camelCase: "blog",
                            snakeCase: "blog",
                            pascalCase: "Blog",
                            screamingSnakeCase: "BLOG",
                        },
                    },
                ],
            },
            discriminantValueV2: {
                name: {
                    unsafeName: {
                        originalValue: "BlogNotFoundError",
                        camelCase: "blogNotFoundError",
                        snakeCase: "blog_not_found_error",
                        pascalCase: "BlogNotFoundError",
                        screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
                    },
                    safeName: {
                        originalValue: "BlogNotFoundError",
                        camelCase: "blogNotFoundError",
                        snakeCase: "blog_not_found_error",
                        pascalCase: "BlogNotFoundError",
                        screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
                    },
                },
                wireValue: "BlogNotFoundError",
            },
            discriminantValueV3: {
                type: "statusCode",
            },
            discriminantValueV4: {
                name: {
                    unsafeName: {
                        originalValue: "BlogNotFoundError",
                        camelCase: "blogNotFoundError",
                        snakeCase: "blog_not_found_error",
                        pascalCase: "BlogNotFoundError",
                        screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
                    },
                    safeName: {
                        originalValue: "BlogNotFoundError",
                        camelCase: "blogNotFoundError",
                        snakeCase: "blog_not_found_error",
                        pascalCase: "BlogNotFoundError",
                        screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
                    },
                },
                wireValue: "BlogNotFoundError",
            },
            http: {
                statusCode: 404,
            },
            statusCode: 404,
            type: {
                aliasOf: {
                    _type: "void",
                },
                resolvedType: {
                    _type: "void",
                },
                _type: "alias",
            },
        },
    ],
    services: {
        http: [],
        websocket: [],
    },
    constants: {
        errorDiscriminant: "_error",
        errorInstanceIdKey: "_errorInstanceId",
        unknownErrorDiscriminantValue: "_unknown",
    },
    constantsV2: {
        errors: {
            errorDiscriminant: {
                originalValue: "error",
                camelCase: "error",
                snakeCase: "error",
                pascalCase: "Error",
                screamingSnakeCase: "ERROR",
                wireValue: "error",
            },
            errorInstanceIdKey: {
                originalValue: "errorInstanceId",
                camelCase: "errorInstanceId",
                snakeCase: "error_instance_id",
                pascalCase: "ErrorInstanceId",
                screamingSnakeCase: "ERROR_INSTANCE_ID",
                wireValue: "errorInstanceId",
            },
            errorContentKey: {
                originalValue: "content",
                camelCase: "content",
                snakeCase: "content",
                pascalCase: "Content",
                screamingSnakeCase: "CONTENT",
                wireValue: "content",
            },
        },
        errorsV2: {
            errorDiscriminant: {
                name: {
                    unsafeName: {
                        originalValue: "error",
                        camelCase: "error",
                        snakeCase: "error",
                        pascalCase: "Error",
                        screamingSnakeCase: "ERROR",
                    },
                    safeName: {
                        originalValue: "error",
                        camelCase: "error",
                        snakeCase: "error",
                        pascalCase: "Error",
                        screamingSnakeCase: "ERROR",
                    },
                },
                wireValue: "error",
            },
            errorInstanceIdKey: {
                name: {
                    unsafeName: {
                        originalValue: "errorInstanceId",
                        camelCase: "errorInstanceId",
                        snakeCase: "error_instance_id",
                        pascalCase: "ErrorInstanceId",
                        screamingSnakeCase: "ERROR_INSTANCE_ID",
                    },
                    safeName: {
                        originalValue: "errorInstanceId",
                        camelCase: "errorInstanceId",
                        snakeCase: "error_instance_id",
                        pascalCase: "ErrorInstanceId",
                        screamingSnakeCase: "ERROR_INSTANCE_ID",
                    },
                },
                wireValue: "errorInstanceId",
            },
            errorContentKey: {
                name: {
                    unsafeName: {
                        originalValue: "content",
                        camelCase: "content",
                        snakeCase: "content",
                        pascalCase: "Content",
                        screamingSnakeCase: "CONTENT",
                    },
                    safeName: {
                        originalValue: "content",
                        camelCase: "content",
                        snakeCase: "content",
                        pascalCase: "Content",
                        screamingSnakeCase: "CONTENT",
                    },
                },
                wireValue: "content",
            },
        },
    },
    environments: [],
    errorDiscriminationStrategy: {
        type: "statusCode",
    },
    sdkConfig: {
        isAuthMandatory: false,
    },
};
