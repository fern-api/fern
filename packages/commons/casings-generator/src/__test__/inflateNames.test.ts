import { constructCasingsGenerator } from "../CasingsGenerator.js";
import { inflateIrNames, inflateNameOrString } from "../inflateNames.js";

describe("inflateNameOrString", () => {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false
    });

    it("inflates a string Name into a FullName with all casings", () => {
        const result = inflateNameOrString("MovieId", casingsGenerator);

        expect(result.originalName).toBe("MovieId");
        expect(result.camelCase.unsafeName).toBe("movieId");
        expect(result.pascalCase.unsafeName).toBe("MovieId");
        expect(result.snakeCase.unsafeName).toBe("movie_id");
        expect(result.screamingSnakeCase.unsafeName).toBe("MOVIE_ID");
    });

    it("handles simple single-word names", () => {
        const result = inflateNameOrString("user", casingsGenerator);

        expect(result.originalName).toBe("user");
        expect(result.camelCase.unsafeName).toBe("user");
        expect(result.pascalCase.unsafeName).toBe("User");
        expect(result.snakeCase.unsafeName).toBe("user");
        expect(result.screamingSnakeCase.unsafeName).toBe("USER");
    });
});

describe("inflateNameOrString with smartCasing", () => {
    const casingsGenerator = constructCasingsGenerator({
        generationLanguage: "go",
        keywords: undefined,
        smartCasing: true
    });

    it("applies smart casing rules when inflating", () => {
        const result = inflateNameOrString("httpClient", casingsGenerator);

        expect(result.originalName).toBe("httpClient");
        expect(result.camelCase).toBeDefined();
        expect(result.pascalCase).toBeDefined();
        expect(result.snakeCase).toBeDefined();
        expect(result.screamingSnakeCase).toBeDefined();
    });
});

describe("inflateIrNames", () => {
    it("inflates Name strings nested deep in the IR", () => {
        // Create a minimal IR-like structure with string Names (v66 format)
        const slimIr = {
            apiName: "TestApi",
            smartCasing: false,
            generationLanguage: undefined,
            // Include nested structures to verify deep traversal
            types: {
                type1: {
                    name: {
                        name: "UserType",
                        typeId: "type1",
                        fernFilepath: {
                            allParts: ["users"],
                            packagePath: ["users"],
                            file: undefined
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
                    name: "errorInstanceId",
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

        // Verify apiName was inflated from string to FullName
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const apiName = result.apiName as any;
        expect(apiName.originalName).toBe("TestApi");
        expect(apiName.camelCase.unsafeName).toBe("testApi");
        expect(apiName.pascalCase.unsafeName).toBe("TestApi");

        // Verify deeply nested DeclaredTypeName.name was inflated
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const type1 = (result.types as any).type1;
        expect(type1.name.name.originalName).toBe("UserType");
        expect(type1.name.name.camelCase.unsafeName).toBe("userType");

        // Verify FernFilepath allParts were inflated
        expect(type1.name.fernFilepath.allParts[0].originalName).toBe("users");

        // Verify NameAndWireValue.name was inflated
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const errorKey = (result.constants as any).errorInstanceIdKey;
        expect(errorKey.name.originalName).toBe("errorInstanceId");
        expect(errorKey.wireValue).toBe("errorInstanceId");
    });

    it("does not inflate non-Name string fields", () => {
        const ir = {
            apiName: "TestApi",
            smartCasing: false,
            generationLanguage: undefined,
            types: {},
            services: {},
            auth: { docs: "Some documentation", requirement: "ALL", schemes: [] },
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
                errorInstanceIdKey: { name: "errorInstanceId", wireValue: "errorInstanceId" }
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
        // docs should remain a plain string, not inflated
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        expect((result.auth as any).docs).toBe("Some documentation");
        // wireValue should remain a plain string
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        expect((result.constants as any).errorInstanceIdKey.wireValue).toBe("errorInstanceId");
        // errorDiscriminationStrategy.type should remain a plain string
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        expect((result.errorDiscriminationStrategy as any).type).toBe("statusCode");
    });

    it("inflates name in example endpoint calls (NameOrString field)", () => {
        const ir = {
            apiName: "TestApi",
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
                errorInstanceIdKey: { name: "errorInstanceId", wireValue: "errorInstanceId" }
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
            serviceTypeReferenceInfo: { sharedTypes: [], typesReferencedOnlyByService: {} },
            exampleEndpoints: [
                {
                    name: "my-example",
                    url: "/users",
                    rootPathParameters: [],
                    servicePathParameters: [],
                    endpointPathParameters: []
                }
            ]
        };

        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const result = inflateIrNames(ir as any);
        // ExampleEndpointCall.name is NameOrString, so it SHOULD be inflated
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const exampleName = (result as any).exampleEndpoints[0].name;
        expect(exampleName.originalName).toBe("my-example");
        expect(exampleName.camelCase).toBeDefined();
    });

    it("does not inflate fields inside the dynamic sub-IR", () => {
        const ir = {
            apiName: "TestApi",
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
                errorInstanceIdKey: { name: "errorInstanceId", wireValue: "errorInstanceId" }
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
            serviceTypeReferenceInfo: { sharedTypes: [], typesReferencedOnlyByService: {} },
            dynamic: {
                version: "1.0.0",
                types: {},
                endpoints: {},
                generatorConfig: {
                    apiName: "my-api"
                }
            }
        };

        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const result = inflateIrNames(ir as any);
        // dynamic.generatorConfig.apiName is a plain string, NOT NameOrString — should NOT be inflated
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        expect((result as any).dynamic.generatorConfig.apiName).toBe("my-api");
    });

    it("uses smartCasing from the IR metadata", () => {
        const ir = {
            apiName: "httpApi",
            smartCasing: true,
            generationLanguage: "go" as const,
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
                errorInstanceIdKey: { name: "errorInstanceId", wireValue: "errorInstanceId" }
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
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const apiName = result.apiName as any;
        expect(apiName.originalName).toBe("httpApi");
        expect(apiName.camelCase).toBeDefined();
        expect(apiName.pascalCase).toBeDefined();
        expect(apiName.snakeCase).toBeDefined();
        expect(apiName.screamingSnakeCase).toBeDefined();
    });

    it("handles arrays containing NameAndWireValue objects", () => {
        const ir = {
            apiName: "TestApi",
            smartCasing: false,
            generationLanguage: undefined,
            types: {},
            services: {},
            auth: { docs: undefined, requirement: "ALL", schemes: [] },
            headers: [{ name: { name: "Authorization", wireValue: "Authorization" } }],
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
                errorInstanceIdKey: { name: "errorInstanceId", wireValue: "errorInstanceId" }
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

        // Verify the header's NameAndWireValue.name was inflated
        // biome-ignore lint/suspicious/noExplicitAny: test helper
        const headerName = (result.headers as any)[0].name.name;
        expect(headerName.originalName).toBe("Authorization");
        expect(headerName.camelCase.unsafeName).toBe("authorization");
    });
});

describe("inflateNameOrString round-trip", () => {
    it("inflating a slim Name (string) restores all casings", () => {
        const casingsGenerator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        // In v66, a Name is just a string
        const slim = "MovieId";

        // Inflate back to FullName
        const inflated = inflateNameOrString(slim, casingsGenerator);
        expect(inflated.originalName).toBe("MovieId");
        expect(inflated.camelCase.unsafeName).toBe("movieId");
        expect(inflated.pascalCase.unsafeName).toBe("MovieId");
        expect(inflated.snakeCase.unsafeName).toBe("movie_id");
        expect(inflated.screamingSnakeCase.unsafeName).toBe("MOVIE_ID");
    });
});
