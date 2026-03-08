import { Name } from "@fern-api/ir-sdk";

import { constructCasingsGenerator } from "../CasingsGenerator.js";
import { inflateIrNames, inflateName } from "../inflateNames.js";

describe("inflateName", () => {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false
    });

    it("returns Name as-is when all casings are present", () => {
        const fullName: Name = {
            originalName: "MovieId",
            camelCase: { unsafeName: "movieId", safeName: "movieId" },
            pascalCase: { unsafeName: "MovieId", safeName: "MovieId" },
            snakeCase: { unsafeName: "movie_id", safeName: "movie_id" },
            screamingSnakeCase: { unsafeName: "MOVIE_ID", safeName: "MOVIE_ID" }
        };

        const result = inflateName(fullName, casingsGenerator);

        // Should return the exact same object reference (no inflation needed)
        expect(result).toBe(fullName);
        expect(result.originalName).toBe("MovieId");
        expect(result.camelCase.unsafeName).toBe("movieId");
    });

    it("inflates a slim Name with only originalName", () => {
        const slimName: Name = {
            originalName: "MovieId",
            camelCase: undefined as unknown as Name["camelCase"],
            pascalCase: undefined as unknown as Name["pascalCase"],
            snakeCase: undefined as unknown as Name["snakeCase"],
            screamingSnakeCase: undefined as unknown as Name["screamingSnakeCase"]
        };

        const result = inflateName(slimName, casingsGenerator);

        expect(result.originalName).toBe("MovieId");
        expect(result.camelCase).toBeDefined();
        expect(result.camelCase.unsafeName).toBe("movieId");
        expect(result.pascalCase).toBeDefined();
        expect(result.pascalCase.unsafeName).toBe("MovieId");
        expect(result.snakeCase).toBeDefined();
        expect(result.snakeCase.unsafeName).toBe("movie_id");
        expect(result.screamingSnakeCase).toBeDefined();
        expect(result.screamingSnakeCase.unsafeName).toBe("MOVIE_ID");
    });

    it("fills in only missing casings, preserving existing ones", () => {
        const partialName: Name = {
            originalName: "MovieId",
            camelCase: { unsafeName: "customCamel", safeName: "customCamel" },
            pascalCase: undefined as unknown as Name["pascalCase"],
            snakeCase: undefined as unknown as Name["snakeCase"],
            screamingSnakeCase: undefined as unknown as Name["screamingSnakeCase"]
        };

        const result = inflateName(partialName, casingsGenerator);

        // Existing casing should be preserved
        expect(result.camelCase.unsafeName).toBe("customCamel");
        // Missing casings should be generated
        expect(result.pascalCase).toBeDefined();
        expect(result.snakeCase).toBeDefined();
        expect(result.screamingSnakeCase).toBeDefined();
    });
});

describe("inflateName with smartCasing", () => {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: "go",
        keywords: undefined,
        smartCasing: true
    });

    it("applies smart casing rules when inflating", () => {
        const slimName: Name = {
            originalName: "httpClient",
            camelCase: undefined as unknown as Name["camelCase"],
            pascalCase: undefined as unknown as Name["pascalCase"],
            snakeCase: undefined as unknown as Name["snakeCase"],
            screamingSnakeCase: undefined as unknown as Name["screamingSnakeCase"]
        };

        const result = inflateName(slimName, casingsGenerator);

        expect(result.originalName).toBe("httpClient");
        expect(result.camelCase).toBeDefined();
        expect(result.pascalCase).toBeDefined();
        expect(result.snakeCase).toBeDefined();
        expect(result.screamingSnakeCase).toBeDefined();
    });
});

describe("inflateIrNames", () => {
    it("inflates Name objects nested deep in the IR", () => {
        // Create a minimal IR-like structure with a slim Name (missing casings)
        const slimIr = {
            apiName: {
                originalName: "TestApi",
                camelCase: undefined,
                pascalCase: undefined,
                snakeCase: undefined,
                screamingSnakeCase: undefined
            },
            smartCasing: false,
            generationLanguage: undefined,
            // Include nested structures to verify deep traversal
            types: {
                type1: {
                    name: {
                        name: {
                            originalName: "UserType",
                            camelCase: undefined,
                            pascalCase: undefined,
                            snakeCase: undefined,
                            screamingSnakeCase: undefined
                        }
                    }
                }
            },
            services: {},
            auth: { docs: undefined, requirement: "ALL", schemes: [] },
            headers: [],
            idempotencyHeaders: [],
            errors: {},
            webhookGroups: {},
            subpackages: {},
            rootPackage: {
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                docs: undefined,
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                navigationConfig: undefined
            },
            constants: {
                errorInstanceIdKey: {
                    name: {
                        originalName: "errorInstanceId",
                        camelCase: undefined,
                        pascalCase: undefined,
                        snakeCase: undefined,
                        screamingSnakeCase: undefined
                    },
                    wireValue: "errorInstanceId"
                }
            },
            pathParameters: [],
            errorDiscriminationStrategy: { type: "statusCode" },
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: false,
                platformHeaders: { language: "", sdkName: "", sdkVersion: "", userAgent: undefined }
            },
            variables: [],
            serviceTypeReferenceInfo: { sharedTypes: [], typesReferencedOnlyByService: {} }
        };

        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const result = inflateIrNames(slimIr as any);

        // Verify apiName was inflated
        expect(result.apiName.camelCase).toBeDefined();
        expect(result.apiName.camelCase?.unsafeName).toBe("testApi");
        expect(result.apiName.pascalCase).toBeDefined();
        expect(result.apiName.pascalCase?.unsafeName).toBe("TestApi");

        // Verify deeply nested Name was inflated
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const type1 = (result.types as any).type1;
        expect(type1.name.name.camelCase).toBeDefined();
        expect(type1.name.name.camelCase.unsafeName).toBe("userType");
        expect(type1.name.name.pascalCase.unsafeName).toBe("UserType");
    });

    it("does not modify IR when all Names already have casings", () => {
        const fullCasingName = {
            originalName: "TestApi",
            camelCase: { unsafeName: "testApi", safeName: "testApi" },
            pascalCase: { unsafeName: "TestApi", safeName: "TestApi" },
            snakeCase: { unsafeName: "test_api", safeName: "test_api" },
            screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" }
        };

        const ir = {
            apiName: fullCasingName,
            smartCasing: false,
            generationLanguage: undefined,
            types: {},
            services: {},
            auth: { docs: undefined, requirement: "ALL", schemes: [] },
            headers: [],
            idempotencyHeaders: [],
            errors: {},
            webhookGroups: {},
            subpackages: {},
            rootPackage: {
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                docs: undefined,
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                navigationConfig: undefined
            },
            constants: {
                errorInstanceIdKey: {
                    name: fullCasingName,
                    wireValue: "errorInstanceId"
                }
            },
            pathParameters: [],
            errorDiscriminationStrategy: { type: "statusCode" },
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: false,
                platformHeaders: { language: "", sdkName: "", sdkVersion: "", userAgent: undefined }
            },
            variables: [],
            serviceTypeReferenceInfo: { sharedTypes: [], typesReferencedOnlyByService: {} }
        };

        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const result = inflateIrNames(ir as any);

        // Should return same object since nothing needed inflation
        expect(result).toBe(ir);
    });

    it("does not false-positive on non-Name objects with originalName property", () => {
        // An object with originalName plus other non-casing keys should NOT be treated as a Name
        const ir = {
            apiName: {
                originalName: "TestApi",
                camelCase: { unsafeName: "testApi", safeName: "testApi" },
                pascalCase: { unsafeName: "TestApi", safeName: "TestApi" },
                snakeCase: { unsafeName: "test_api", safeName: "test_api" },
                screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" }
            },
            smartCasing: false,
            generationLanguage: undefined,
            types: {
                notAName: {
                    originalName: "SomeValue",
                    someOtherField: "data",
                    anotherField: 42
                }
            },
            services: {},
            auth: { docs: undefined, requirement: "ALL", schemes: [] },
            headers: [],
            idempotencyHeaders: [],
            errors: {},
            webhookGroups: {},
            subpackages: {},
            rootPackage: {
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                docs: undefined,
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                navigationConfig: undefined
            },
            constants: {
                errorInstanceIdKey: {
                    name: {
                        originalName: "errorInstanceId",
                        camelCase: { unsafeName: "errorInstanceId", safeName: "errorInstanceId" },
                        pascalCase: { unsafeName: "ErrorInstanceId", safeName: "ErrorInstanceId" },
                        snakeCase: { unsafeName: "error_instance_id", safeName: "error_instance_id" },
                        screamingSnakeCase: {
                            unsafeName: "ERROR_INSTANCE_ID",
                            safeName: "ERROR_INSTANCE_ID"
                        }
                    },
                    wireValue: "errorInstanceId"
                }
            },
            pathParameters: [],
            errorDiscriminationStrategy: { type: "statusCode" },
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: false,
                platformHeaders: { language: "", sdkName: "", sdkVersion: "", userAgent: undefined }
            },
            variables: [],
            serviceTypeReferenceInfo: { sharedTypes: [], typesReferencedOnlyByService: {} }
        };

        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const result = inflateIrNames(ir as any);

        // The non-Name object should NOT have been inflated (no casing keys added)
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const notAName = (result.types as any).notAName;
        expect(notAName.originalName).toBe("SomeValue");
        expect(notAName.someOtherField).toBe("data");
        expect(notAName.camelCase).toBeUndefined();
        expect(notAName.pascalCase).toBeUndefined();
    });

    it("uses smartCasing from the IR metadata", () => {
        const ir = {
            apiName: {
                originalName: "httpApi",
                camelCase: undefined,
                pascalCase: undefined,
                snakeCase: undefined,
                screamingSnakeCase: undefined
            },
            smartCasing: true,
            generationLanguage: "go",
            types: {},
            services: {},
            auth: { docs: undefined, requirement: "ALL", schemes: [] },
            headers: [],
            idempotencyHeaders: [],
            errors: {},
            webhookGroups: {},
            subpackages: {},
            rootPackage: {
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                docs: undefined,
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                navigationConfig: undefined
            },
            constants: {
                errorInstanceIdKey: {
                    name: {
                        originalName: "errorInstanceId",
                        camelCase: { unsafeName: "errorInstanceId", safeName: "errorInstanceId" },
                        pascalCase: { unsafeName: "ErrorInstanceId", safeName: "ErrorInstanceId" },
                        snakeCase: { unsafeName: "error_instance_id", safeName: "error_instance_id" },
                        screamingSnakeCase: {
                            unsafeName: "ERROR_INSTANCE_ID",
                            safeName: "ERROR_INSTANCE_ID"
                        }
                    },
                    wireValue: "errorInstanceId"
                }
            },
            pathParameters: [],
            errorDiscriminationStrategy: { type: "statusCode" },
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: false,
                platformHeaders: { language: "", sdkName: "", sdkVersion: "", userAgent: undefined }
            },
            variables: [],
            serviceTypeReferenceInfo: { sharedTypes: [], typesReferencedOnlyByService: {} }
        };

        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const result = inflateIrNames(ir as any);

        // With smartCasing + Go, HTTP should be capitalized as an initialism
        expect(result.apiName.camelCase).toBeDefined();
        expect(result.apiName.pascalCase).toBeDefined();
        expect(result.apiName.snakeCase).toBeDefined();
        expect(result.apiName.screamingSnakeCase).toBeDefined();
    });

    it("handles arrays of Name objects", () => {
        const ir = {
            apiName: {
                originalName: "TestApi",
                camelCase: { unsafeName: "testApi", safeName: "testApi" },
                pascalCase: { unsafeName: "TestApi", safeName: "TestApi" },
                snakeCase: { unsafeName: "test_api", safeName: "test_api" },
                screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" }
            },
            smartCasing: false,
            generationLanguage: undefined,
            types: {},
            services: {},
            auth: { docs: undefined, requirement: "ALL", schemes: [] },
            headers: [
                {
                    name: {
                        name: {
                            originalName: "Authorization",
                            camelCase: undefined,
                            pascalCase: undefined,
                            snakeCase: undefined,
                            screamingSnakeCase: undefined
                        },
                        wireValue: "Authorization"
                    }
                }
            ],
            idempotencyHeaders: [],
            errors: {},
            webhookGroups: {},
            subpackages: {},
            rootPackage: {
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                docs: undefined,
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                navigationConfig: undefined
            },
            constants: {
                errorInstanceIdKey: {
                    name: {
                        originalName: "errorInstanceId",
                        camelCase: { unsafeName: "errorInstanceId", safeName: "errorInstanceId" },
                        pascalCase: { unsafeName: "ErrorInstanceId", safeName: "ErrorInstanceId" },
                        snakeCase: { unsafeName: "error_instance_id", safeName: "error_instance_id" },
                        screamingSnakeCase: {
                            unsafeName: "ERROR_INSTANCE_ID",
                            safeName: "ERROR_INSTANCE_ID"
                        }
                    },
                    wireValue: "errorInstanceId"
                }
            },
            pathParameters: [],
            errorDiscriminationStrategy: { type: "statusCode" },
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: false,
                platformHeaders: { language: "", sdkName: "", sdkVersion: "", userAgent: undefined }
            },
            variables: [],
            serviceTypeReferenceInfo: { sharedTypes: [], typesReferencedOnlyByService: {} }
        };

        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const result = inflateIrNames(ir as any);

        // Verify the header Name was inflated inside the array
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const headerName = (result.headers as any)[0].name.name;
        expect(headerName.camelCase).toBeDefined();
        expect(headerName.camelCase.unsafeName).toBe("authorization");
    });
});
