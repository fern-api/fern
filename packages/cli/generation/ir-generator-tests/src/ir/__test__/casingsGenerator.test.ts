import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { Name } from "@fern-api/ir-sdk";

describe("casingsGenerator", () => {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: true
    });
    it("simple", () => {
        const expected: Name = "hello";
        const actual = casingsGenerator.generateName(expected);
        expect(actual).toEqual(expected);
    });

    it("multiple", () => {
        const expected: Name = "helloWorld";
        const actual = casingsGenerator.generateName(expected);
        expect(actual).toEqual(expected);
    });

    it("single initialism", () => {
        const expected: Name = {
            originalName: "api",
            camelCase: undefined,
            pascalCase: {
                safeName: "API",
                unsafeName: "API"
            },
            snakeCase: undefined,
            screamingSnakeCase: undefined
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
            snakeCase: undefined,
            screamingSnakeCase: undefined
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("adjacent initialism", () => {
        const expected: Name = "apiUrl";
        const actual = casingsGenerator.generateName(expected);
        expect(actual).toEqual(expected);
    });

    it("adjacent plural initialism", () => {
        const expected: Name = "apiUrls";
        const actual = casingsGenerator.generateName(expected);
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
            snakeCase: undefined,
            screamingSnakeCase: undefined
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
            snakeCase: undefined,
            screamingSnakeCase: undefined
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });

    it("alphanumeric snake casing", () => {
        const expected: Name = {
            originalName: "application v1",
            camelCase: undefined,
            pascalCase: undefined,
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
            snakeCase: undefined,
            screamingSnakeCase: undefined
        };
        const actual = casingsGenerator.generateName(expected.originalName);
        expect(actual).toEqual(expected);
    });
});
