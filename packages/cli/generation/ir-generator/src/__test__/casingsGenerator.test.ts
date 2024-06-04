import { generatorsYml } from "@fern-api/configuration";
import { Name } from "@fern-api/ir-sdk";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";

describe("casingsGenerator", () => {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: true,
        casingVersion: generatorsYml.CasingVersion.V1
    });
    it("simple", () => {
        const expected: Name = {
            originalName: "hello",
            camelCase: {
                safeName: "hello",
                unsafeName: "hello"
            },
            pascalCase: {
                safeName: "Hello",
                unsafeName: "Hello"
            },
            snakeCase: {
                safeName: "hello",
                unsafeName: "hello"
            },
            screamingSnakeCase: {
                safeName: "HELLO",
                unsafeName: "HELLO"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("multiple", () => {
        const expected: Name = {
            originalName: "helloWorld",
            camelCase: {
                safeName: "helloWorld",
                unsafeName: "helloWorld"
            },
            pascalCase: {
                safeName: "HelloWorld",
                unsafeName: "HelloWorld"
            },
            snakeCase: {
                safeName: "hello_world",
                unsafeName: "hello_world"
            },
            screamingSnakeCase: {
                safeName: "HELLO_WORLD",
                unsafeName: "HELLO_WORLD"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("single initialism", () => {
        const expected: Name = {
            originalName: "api",
            camelCase: {
                safeName: "api",
                unsafeName: "api"
            },
            pascalCase: {
                safeName: "API",
                unsafeName: "API"
            },
            snakeCase: {
                safeName: "api",
                unsafeName: "api"
            },
            screamingSnakeCase: {
                safeName: "API",
                unsafeName: "API"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("multiple with single initialism", () => {
        const expected: Name = {
            originalName: "userApi",
            camelCase: {
                safeName: "userAPI",
                unsafeName: "userAPI"
            },
            pascalCase: {
                safeName: "UserAPI",
                unsafeName: "UserAPI"
            },
            snakeCase: {
                safeName: "user_api",
                unsafeName: "user_api"
            },
            screamingSnakeCase: {
                safeName: "USER_API",
                unsafeName: "USER_API"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("adjacent initialism", () => {
        const expected: Name = {
            originalName: "apiUrl",
            camelCase: {
                safeName: "apiUrl",
                unsafeName: "apiUrl"
            },
            pascalCase: {
                safeName: "ApiUrl",
                unsafeName: "ApiUrl"
            },
            snakeCase: {
                safeName: "api_url",
                unsafeName: "api_url"
            },
            screamingSnakeCase: {
                safeName: "API_URL",
                unsafeName: "API_URL"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("adjacent plural initialism", () => {
        const expected: Name = {
            originalName: "apiUrls",
            camelCase: {
                safeName: "apiUrls",
                unsafeName: "apiUrls"
            },
            pascalCase: {
                safeName: "ApiUrls",
                unsafeName: "ApiUrls"
            },
            snakeCase: {
                safeName: "api_urls",
                unsafeName: "api_urls"
            },
            screamingSnakeCase: {
                safeName: "API_URLS",
                unsafeName: "API_URLS"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("non-adjacent initialism", () => {
        const expected: Name = {
            originalName: "getUrlAsJson",
            camelCase: {
                safeName: "getURLAsJSON",
                unsafeName: "getURLAsJSON"
            },
            pascalCase: {
                safeName: "GetURLAsJSON",
                unsafeName: "GetURLAsJSON"
            },
            snakeCase: {
                safeName: "get_url_as_json",
                unsafeName: "get_url_as_json"
            },
            screamingSnakeCase: {
                safeName: "GET_URL_AS_JSON",
                unsafeName: "GET_URL_AS_JSON"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("plural initialism", () => {
        const expected: Name = {
            originalName: "getUserIds",
            camelCase: {
                safeName: "getUserIDs",
                unsafeName: "getUserIDs"
            },
            pascalCase: {
                safeName: "GetUserIDs",
                unsafeName: "GetUserIDs"
            },
            snakeCase: {
                safeName: "get_user_ids",
                unsafeName: "get_user_ids"
            },
            screamingSnakeCase: {
                safeName: "GET_USER_IDS",
                unsafeName: "GET_USER_IDS"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("alphanumeric snake casing", () => {
        const expected: Name = {
            originalName: "application v1",
            camelCase: {
                safeName: "applicationV1",
                unsafeName: "applicationV1"
            },
            pascalCase: {
                safeName: "ApplicationV1",
                unsafeName: "ApplicationV1"
            },
            snakeCase: {
                safeName: "application_v1",
                unsafeName: "application_v1"
            },
            screamingSnakeCase: {
                safeName: "APPLICATION_V1",
                unsafeName: "APPLICATION_V1"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    // it("alphanumeric snake casing with postfix", () => {
    //     const expected: Name = {
    //         originalName: "application v1 and 2v22",
    //         camelCase: {
    //             safeName: "applicationV1And2V22",
    //             unsafeName: "applicationV1And2V22"
    //         },
    //         pascalCase: {
    //             safeName: "ApplicationV1And2V22",
    //             unsafeName: "ApplicationV1And2V22"
    //         },
    //         snakeCase: {
    //             safeName: "application_v1_and_2v22",
    //             unsafeName: "application_v1_and_2v22"
    //         },
    //         screamingSnakeCase: {
    //             safeName: "APPLICATION_V1_AND_2V22",
    //             unsafeName: "APPLICATION_V1_AND_2V22"
    //         }
    //     };
    //     const actual = casingsGenerator.generateName(expected.originalName);
    //     expect(actual).toEqual(expected);
    // });

    it("S3Bucket", () => {
        const expected: Name = {
            originalName: "S3Bucket",
            camelCase: {
                safeName: "s3Bucket",
                unsafeName: "s3Bucket"
            },
            pascalCase: {
                safeName: "S3Bucket",
                unsafeName: "S3Bucket"
            },
            snakeCase: {
                safeName: "s3_bucket",
                unsafeName: "s3_bucket"
            },
            screamingSnakeCase: {
                safeName: "S3_BUCKET",
                unsafeName: "S3_BUCKET"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("saml", () => {
        const expected: Name = {
            originalName: "get_saml_code_request",
            camelCase: {
                safeName: "getSAMLCodeRequest",
                unsafeName: "getSAMLCodeRequest"
            },
            pascalCase: {
                safeName: "GetSAMLCodeRequest",
                unsafeName: "GetSAMLCodeRequest"
            },
            snakeCase: {
                safeName: "get_saml_code_request",
                unsafeName: "get_saml_code_request"
            },
            screamingSnakeCase: {
                safeName: "GET_SAML_CODE_REQUEST",
                unsafeName: "GET_SAML_CODE_REQUEST"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("preservedCasing", () => {
        const expected: Name = {
            originalName: "get_oauth",
            camelCase: {
                safeName: "getOAuth",
                unsafeName: "getOAuth"
            },
            pascalCase: {
                safeName: "GetOAuth",
                unsafeName: "GetOAuth"
            },
            snakeCase: {
                safeName: "get_oauth",
                unsafeName: "get_oauth"
            },
            screamingSnakeCase: {
                safeName: "GET_OAUTH",
                unsafeName: "GET_OAUTH"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("preservedCasing", () => {
        const expected: Name = {
            originalName: "geTOAuth",
            camelCase: {
                safeName: "geTOAuth",
                unsafeName: "geTOAuth"
            },
            pascalCase: {
                safeName: "GeTOAuth",
                unsafeName: "GeTOAuth"
            },
            snakeCase: {
                safeName: "ge_t_oauth",
                unsafeName: "ge_t_oauth"
            },
            screamingSnakeCase: {
                safeName: "GE_T_OAUTH",
                unsafeName: "GE_T_OAUTH"
            }
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });
});
