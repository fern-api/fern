import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V66_TO_V65_MIGRATION } from "../migrateFromV66ToV65";

describe("migrateFromV66ToV65", () => {
    const mockContext = {
        taskContext: createMockTaskContext(),
        targetGenerator: {
            name: "test-generator",
            version: "0.0.0"
        }
    };

    // Helper to create a minimal V66 IR with just the fields we need for testing
    const createMinimalV66IR = (
        overrides: Partial<IrVersions.V66.ir.IntermediateRepresentation>
    ): IrVersions.V66.ir.IntermediateRepresentation => {
        return {
            fdrApiDefinitionId: undefined,
            apiVersion: undefined,
            apiName: "TestApi",
            apiDisplayName: undefined,
            apiDocs: undefined,
            auth: {
                docs: undefined,
                requirement: "ALL",
                schemes: []
            },
            headers: [],
            idempotencyHeaders: [],
            types: {},
            errors: {},
            services: {},
            webhookGroups: {},
            websocketChannels: undefined,
            constants: {
                errorInstanceIdKey: "errorInstanceId"
            },
            environments: undefined,
            basePath: undefined,
            pathParameters: [],
            variables: [],
            serviceTypeReferenceInfo: {
                typesReferencedOnlyByService: {},
                sharedTypes: []
            },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: undefined,
            casingsConfig: {
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: true
            },
            subpackages: {},
            rootPackage: {
                docs: undefined,
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: false,
                navigationConfig: undefined
            },
            sdkConfig: {
                isAuthMandatory: false,
                hasStreamingEndpoints: false,
                hasFileDownloadEndpoints: false,
                platformHeaders: {
                    language: "X-Fern-Language",
                    sdkName: "X-Fern-SDK-Name",
                    sdkVersion: "X-Fern-SDK-Version",
                    userAgent: undefined
                },
                hasPaginatedEndpoints: false
            },
            errorDiscriminationStrategy: IrVersions.V66.ErrorDiscriminationStrategy.statusCode(),
            selfHosted: undefined,
            audiences: [],
            generationMetadata: undefined,
            apiPlayground: undefined,
            ...overrides
        } as IrVersions.V66.ir.IntermediateRepresentation;
    };

    describe("name inflation", () => {
        it("inflates apiName from string to full Name object", () => {
            const v66IR = createMinimalV66IR({ apiName: "MyApi" });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.apiName.originalName).toBe("MyApi");
            expect(v65IR.apiName.camelCase).toBeDefined();
            expect(v65IR.apiName.camelCase.unsafeName).toBe("myAPI");
            expect(v65IR.apiName.pascalCase).toBeDefined();
            expect(v65IR.apiName.pascalCase.unsafeName).toBe("MyAPI");
            expect(v65IR.apiName.snakeCase).toBeDefined();
            expect(v65IR.apiName.snakeCase.unsafeName).toBe("my_api");
            expect(v65IR.apiName.screamingSnakeCase).toBeDefined();
        });

        it("inflates apiName that is already a full Name object", () => {
            const fullName: IrVersions.V66.Name = {
                originalName: "MyApi",
                camelCase: { safeName: "myApi", unsafeName: "myApi" },
                pascalCase: { safeName: "MyApi", unsafeName: "MyApi" },
                snakeCase: { safeName: "my_api", unsafeName: "my_api" },
                screamingSnakeCase: { safeName: "MY_API", unsafeName: "MY_API" }
            };
            const v66IR = createMinimalV66IR({ apiName: fullName as IrVersions.V66.NameOrString });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.apiName.originalName).toBe("MyApi");
            expect(v65IR.apiName.camelCase.unsafeName).toBe("myApi");
        });
    });

    describe("type declaration inflation", () => {
        it("inflates object type with string property names", () => {
            const objectType: IrVersions.V66.TypeDeclaration = {
                docs: undefined,
                availability: undefined,
                name: {
                    typeId: "type_MyObject",
                    fernFilepath: {
                        allParts: ["api"],
                        packagePath: ["api"],
                        file: undefined
                    },
                    name: "MyObject",
                    displayName: undefined
                },
                shape: IrVersions.V66.Type.object({
                    properties: [
                        {
                            docs: undefined,
                            availability: undefined,
                            name: "userName",
                            valueType: IrVersions.V66.TypeReference.primitive({
                                v1: "STRING",
                                v2: undefined
                            }),
                            v2Examples: undefined,
                            propertyAccess: undefined
                        }
                    ],
                    extendedProperties: undefined,
                    extends: [],
                    extraProperties: false
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set<string>(),
                encoding: undefined,
                source: undefined,
                inline: undefined
            };

            const v66IR = createMinimalV66IR({
                types: { type_MyObject: objectType }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedType = v65IR.types["type_MyObject"];
            expect(migratedType).toBeDefined();
            expect(migratedType?.name.name.originalName).toBe("MyObject");
            expect(migratedType?.name.name.pascalCase).toBeDefined();

            // Check FernFilepath inflation
            const fernFilepath = migratedType?.name.fernFilepath;
            expect(fernFilepath?.allParts[0]?.originalName).toBe("api");
            expect(fernFilepath?.packagePath[0]?.originalName).toBe("api");

            // Check object property name inflation
            expect(migratedType?.shape.type).toBe("object");
            if (migratedType?.shape.type === "object") {
                const prop = migratedType.shape.properties[0];
                expect(prop?.name.wireValue).toBe("userName");
                expect(prop?.name.name.originalName).toBe("userName");
                expect(prop?.name.name.camelCase).toBeDefined();
            }
        });

        it("inflates enum type with string enum value names", () => {
            const enumType: IrVersions.V66.TypeDeclaration = {
                docs: undefined,
                availability: undefined,
                name: {
                    typeId: "type_Status",
                    fernFilepath: {
                        allParts: [],
                        packagePath: [],
                        file: undefined
                    },
                    name: "Status",
                    displayName: undefined
                },
                shape: IrVersions.V66.Type.enum({
                    default: undefined,
                    values: [
                        {
                            docs: undefined,
                            availability: undefined,
                            name: "Active"
                        },
                        {
                            docs: undefined,
                            availability: undefined,
                            name: "Inactive"
                        }
                    ],
                    forwardCompatible: false
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set<string>(),
                encoding: undefined,
                source: undefined,
                inline: undefined
            };

            const v66IR = createMinimalV66IR({
                types: { type_Status: enumType }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedType = v65IR.types["type_Status"];
            expect(migratedType?.shape.type).toBe("enum");
            if (migratedType?.shape.type === "enum") {
                const firstValue = migratedType.shape.values[0];
                expect(firstValue?.name.wireValue).toBe("Active");
                expect(firstValue?.name.name.originalName).toBe("Active");
                expect(firstValue?.name.name.pascalCase).toBeDefined();

                const secondValue = migratedType.shape.values[1];
                expect(secondValue?.name.wireValue).toBe("Inactive");
                expect(secondValue?.name.name.originalName).toBe("Inactive");
            }
        });

        it("inflates union type with string discriminant and variant names", () => {
            const unionType: IrVersions.V66.TypeDeclaration = {
                docs: undefined,
                availability: undefined,
                name: {
                    typeId: "type_Shape",
                    fernFilepath: {
                        allParts: [],
                        packagePath: [],
                        file: undefined
                    },
                    name: "Shape",
                    displayName: undefined
                },
                shape: IrVersions.V66.Type.union({
                    discriminant: "type",
                    extends: [],
                    baseProperties: [],
                    types: [
                        {
                            docs: undefined,
                            availability: undefined,
                            discriminantValue: "circle",
                            shape: IrVersions.V66.SingleUnionTypeProperties.noProperties(),
                            displayName: undefined
                        }
                    ],
                    discriminatorContext: undefined
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set<string>(),
                encoding: undefined,
                source: undefined,
                inline: undefined
            };

            const v66IR = createMinimalV66IR({
                types: { type_Shape: unionType }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedType = v65IR.types["type_Shape"];
            expect(migratedType?.shape.type).toBe("union");
            if (migratedType?.shape.type === "union") {
                // Discriminant inflated
                expect(migratedType.shape.discriminant.wireValue).toBe("type");
                expect(migratedType.shape.discriminant.name.originalName).toBe("type");

                // Union variant discriminantValue inflated
                const variant = migratedType.shape.types[0];
                expect(variant?.discriminantValue.wireValue).toBe("circle");
                expect(variant?.discriminantValue.name.originalName).toBe("circle");
                expect(variant?.discriminantValue.name.camelCase).toBeDefined();
            }
        });

        it("inflates forwardCompatible enum", () => {
            const enumType: IrVersions.V66.TypeDeclaration = {
                docs: undefined,
                availability: undefined,
                name: {
                    typeId: "type_Status",
                    fernFilepath: {
                        allParts: [],
                        packagePath: [],
                        file: undefined
                    },
                    name: "Status",
                    displayName: undefined
                },
                shape: IrVersions.V66.Type.enum({
                    default: undefined,
                    values: [
                        {
                            docs: undefined,
                            availability: undefined,
                            name: "Active"
                        }
                    ],
                    forwardCompatible: true
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set<string>(),
                encoding: undefined,
                source: undefined,
                inline: undefined
            };

            const v66IR = createMinimalV66IR({
                types: { type_Status: enumType }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedType = v65IR.types["type_Status"];
            expect(migratedType?.shape.type).toBe("enum");
            if (migratedType?.shape.type === "enum") {
                expect(migratedType.shape.forwardCompatible).toBe(true);
            }
        });

        it("inflates alias type", () => {
            const aliasType: IrVersions.V66.TypeDeclaration = {
                docs: undefined,
                availability: undefined,
                name: {
                    typeId: "type_UserId",
                    fernFilepath: {
                        allParts: [],
                        packagePath: [],
                        file: undefined
                    },
                    name: "UserId",
                    displayName: undefined
                },
                shape: IrVersions.V66.Type.alias({
                    aliasOf: IrVersions.V66.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    resolvedType: IrVersions.V66.ResolvedTypeReference.primitive({ v1: "STRING", v2: undefined })
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set<string>(),
                encoding: undefined,
                source: undefined,
                inline: undefined
            };

            const v66IR = createMinimalV66IR({
                types: { type_UserId: aliasType }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedType = v65IR.types["type_UserId"];
            expect(migratedType?.shape.type).toBe("alias");
            if (migratedType?.shape.type === "alias") {
                expect(migratedType.shape.aliasOf.type).toBe("primitive");
            }
        });
    });

    describe("error declaration inflation", () => {
        it("inflates error with string names", () => {
            const errorDecl: IrVersions.V66.ErrorDeclaration = {
                docs: undefined,
                name: {
                    errorId: "error_NotFound",
                    fernFilepath: {
                        allParts: ["errors"],
                        packagePath: ["errors"],
                        file: undefined
                    },
                    name: "NotFound"
                },
                discriminantValue: "NotFoundError",
                statusCode: 404,
                type: undefined,
                isWildcardStatusCode: undefined,
                headers: undefined,
                examples: [],
                v2Examples: undefined,
                displayName: undefined
            };

            const v66IR = createMinimalV66IR({
                errors: { error_NotFound: errorDecl }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedError = v65IR.errors["error_NotFound"];
            expect(migratedError).toBeDefined();
            expect(migratedError?.name.name.originalName).toBe("NotFound");
            expect(migratedError?.name.name.pascalCase).toBeDefined();
            expect(migratedError?.name.fernFilepath.allParts[0]?.originalName).toBe("errors");

            // discriminantValue is a NameAndWireValueOrString → inflated
            expect(migratedError?.discriminantValue.wireValue).toBe("NotFoundError");
            expect(migratedError?.discriminantValue.name.originalName).toBe("NotFoundError");
        });
    });

    describe("service and endpoint inflation", () => {
        it("inflates service with endpoint containing string names", () => {
            const service: IrVersions.V66.HttpService = {
                availability: undefined,
                name: {
                    fernFilepath: {
                        allParts: ["users"],
                        packagePath: ["users"],
                        file: undefined
                    }
                },
                displayName: undefined,
                basePath: {
                    head: "/users",
                    parts: []
                },
                headers: [],
                pathParameters: [],
                endpoints: [
                    {
                        docs: undefined,
                        availability: undefined,
                        id: "endpoint_getUser",
                        name: "getUser",
                        displayName: undefined,
                        method: "GET",
                        headers: [],
                        responseHeaders: undefined,
                        queryParameters: [],
                        pathParameters: [],
                        allPathParameters: [],
                        path: {
                            head: "/{userId}",
                            parts: []
                        },
                        fullPath: {
                            head: "/users/{userId}",
                            parts: []
                        },
                        requestBody: undefined,
                        v2RequestBodies: undefined,
                        sdkRequest: undefined,
                        response: undefined,
                        v2Responses: undefined,
                        errors: [],
                        auth: false,
                        security: undefined,
                        idempotent: false,
                        baseUrl: undefined,
                        v2BaseUrls: undefined,
                        basePath: undefined,
                        autogeneratedExamples: [],
                        userSpecifiedExamples: [],
                        v2Examples: undefined,
                        pagination: undefined,
                        transport: undefined,
                        source: undefined,
                        audiences: [],
                        retries: undefined,
                        apiPlayground: undefined
                    } as unknown as IrVersions.V66.HttpEndpoint
                ],
                encoding: undefined,
                transport: undefined,
                audiences: undefined
            };

            const v66IR = createMinimalV66IR({
                services: { service_users: service }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedService = v65IR.services["service_users"];
            expect(migratedService).toBeDefined();

            // Service name FernFilepath inflated
            expect(migratedService?.name.fernFilepath.allParts[0]?.originalName).toBe("users");

            // Endpoint name inflated
            const endpoint = migratedService?.endpoints[0];
            expect(endpoint?.name.originalName).toBe("getUser");
            expect(endpoint?.name.camelCase).toBeDefined();
        });
    });

    describe("header inflation", () => {
        it("inflates top-level headers with string names", () => {
            const header: IrVersions.V66.HttpHeader = {
                docs: undefined,
                availability: undefined,
                name: "Authorization",
                valueType: IrVersions.V66.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                env: undefined,
                v2Examples: undefined,
                clientDefault: undefined
            };

            const v66IR = createMinimalV66IR({ headers: [header] });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.headers.length).toBe(1);
            const migratedHeader = v65IR.headers[0];
            expect(migratedHeader?.name.wireValue).toBe("Authorization");
            expect(migratedHeader?.name.name.originalName).toBe("Authorization");
            expect(migratedHeader?.name.name.pascalCase).toBeDefined();
        });
    });

    describe("auth scheme inflation", () => {
        it("inflates bearer auth with string token name", () => {
            const bearerScheme = IrVersions.V66.AuthScheme.bearer({
                docs: undefined,
                token: "apiToken",
                tokenEnvVar: undefined,
                key: "bearer"
            });

            const v66IR = createMinimalV66IR({
                auth: {
                    docs: undefined,
                    requirement: "ALL",
                    schemes: [bearerScheme]
                }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.auth.schemes.length).toBe(1);
            const migratedScheme = v65IR.auth.schemes[0];
            expect(migratedScheme?.type).toBe("bearer");
            if (migratedScheme?.type === "bearer") {
                expect(migratedScheme.token.originalName).toBe("apiToken");
                expect(migratedScheme.token.camelCase).toBeDefined();
            }
        });

        it("inflates basic auth with string username and password names", () => {
            const basicScheme = IrVersions.V66.AuthScheme.basic({
                docs: undefined,
                username: "user",
                usernameEnvVar: undefined,
                usernameOmit: undefined,
                password: "pass",
                passwordEnvVar: undefined,
                passwordOmit: undefined,
                key: "basic"
            });

            const v66IR = createMinimalV66IR({
                auth: {
                    docs: undefined,
                    requirement: "ALL",
                    schemes: [basicScheme]
                }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedScheme = v65IR.auth.schemes[0];
            expect(migratedScheme?.type).toBe("basic");
            if (migratedScheme?.type === "basic") {
                expect(migratedScheme.username.originalName).toBe("user");
                expect(migratedScheme.password.originalName).toBe("pass");
            }
        });

        it("inflates header auth with string name and prefix", () => {
            const headerScheme = IrVersions.V66.AuthScheme.header({
                docs: undefined,
                name: "apiKey",
                valueType: IrVersions.V66.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                prefix: undefined,
                headerEnvVar: undefined,
                key: "header"
            });

            const v66IR = createMinimalV66IR({
                auth: {
                    docs: undefined,
                    requirement: "ALL",
                    schemes: [headerScheme]
                }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedScheme = v65IR.auth.schemes[0];
            expect(migratedScheme?.type).toBe("header");
            if (migratedScheme?.type === "header") {
                expect(migratedScheme.name.wireValue).toBe("apiKey");
                expect(migratedScheme.name.name.originalName).toBe("apiKey");
            }
        });
    });

    describe("subpackage inflation", () => {
        it("inflates subpackage with string names", () => {
            const subpackage: IrVersions.V66.Subpackage = {
                docs: undefined,
                fernFilepath: {
                    allParts: ["api", "users"],
                    packagePath: ["api"],
                    file: "users"
                },
                name: "users",
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                webhooks: undefined,
                websocket: undefined,
                hasEndpointsInTree: true,
                navigationConfig: undefined,
                displayName: undefined
            };

            const v66IR = createMinimalV66IR({
                subpackages: { subpackage_users: subpackage }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const migratedSubpackage = v65IR.subpackages["subpackage_users"];
            expect(migratedSubpackage).toBeDefined();
            expect(migratedSubpackage?.name.originalName).toBe("users");
            expect(migratedSubpackage?.name.pascalCase).toBeDefined();

            // FernFilepath allParts inflated
            expect(migratedSubpackage?.fernFilepath.allParts.length).toBe(2);
            expect(migratedSubpackage?.fernFilepath.allParts[0]?.originalName).toBe("api");
            expect(migratedSubpackage?.fernFilepath.allParts[1]?.originalName).toBe("users");

            // File inflated
            expect(migratedSubpackage?.fernFilepath.file?.originalName).toBe("users");
        });
    });

    describe("casingsConfig handling", () => {
        it("uses default smartCasing when casingsConfig is undefined", () => {
            const v66IR = createMinimalV66IR({
                casingsConfig: undefined,
                apiName: "TestApi"
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            // Should still inflate names correctly
            expect(v65IR.apiName.originalName).toBe("TestApi");
            expect(v65IR.apiName.camelCase).toBeDefined();
        });

        it("uses smartCasing=true from casingsConfig", () => {
            const v66IR = createMinimalV66IR({
                casingsConfig: {
                    generationLanguage: "typescript",
                    keywords: ["class", "interface"],
                    smartCasing: true
                },
                apiName: "TestApi"
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.apiName.originalName).toBe("TestApi");
            expect(v65IR.apiName.pascalCase).toBeDefined();
        });
    });

    describe("environment inflation", () => {
        it("inflates single base URL environment with string names", () => {
            const v66IR = createMinimalV66IR({
                environments: {
                    defaultEnvironment: "production",
                    environments: IrVersions.V66.Environments.singleBaseUrl({
                        environments: [
                            {
                                id: "env_production",
                                name: "Production",
                                url: "https://api.example.com",
                                docs: undefined,
                                audiences: undefined,
                                defaultUrl: undefined,
                                urlTemplate: undefined,
                                urlVariables: undefined
                            }
                        ]
                    })
                }
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.environments).toBeDefined();
            if (v65IR.environments?.environments.type === "singleBaseUrl") {
                const env = v65IR.environments.environments.environments[0];
                expect(env?.name.originalName).toBe("Production");
                expect(env?.name.camelCase).toBeDefined();
            }
        });
    });

    describe("variable inflation", () => {
        it("inflates variables with string names", () => {
            const variable: IrVersions.V66.VariableDeclaration = {
                docs: undefined,
                id: "var_baseUrl",
                name: "baseUrl",
                type: IrVersions.V66.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };

            const v66IR = createMinimalV66IR({
                variables: [variable]
            });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.variables.length).toBe(1);
            expect(v65IR.variables[0]?.name.originalName).toBe("baseUrl");
            expect(v65IR.variables[0]?.name.camelCase).toBeDefined();
        });
    });

    describe("dynamic IR inflation", () => {
        // Helper to build a dynamic Name object (the dynamic IR does not use compressed
        // NameOrString — its FernFilepath and Declaration fields use full Name objects).
        const makeDynamicName = (originalName: string): IrVersions.V66.dynamic.Name => ({
            originalName,
            camelCase: { safeName: originalName, unsafeName: originalName },
            pascalCase: { safeName: originalName, unsafeName: originalName },
            snakeCase: { safeName: originalName, unsafeName: originalName },
            screamingSnakeCase: { safeName: originalName.toUpperCase(), unsafeName: originalName.toUpperCase() }
        });

        const makeDynamicNameAndWireValue = (wireValue: string): IrVersions.V66.dynamic.NameAndWireValue => ({
            wireValue,
            name: makeDynamicName(wireValue)
        });

        it("passes through dynamic IR object type with full Name objects intact", () => {
            const dynamicIr: IrVersions.V66.dynamic.DynamicIntermediateRepresentation = {
                version: "1.0.0",
                types: {
                    type_User: IrVersions.V66.dynamic.NamedType.object({
                        declaration: {
                            fernFilepath: {
                                allParts: [makeDynamicName("user")],
                                packagePath: [makeDynamicName("user")],
                                file: makeDynamicName("User")
                            },
                            name: makeDynamicName("User")
                        },
                        properties: [
                            {
                                name: makeDynamicNameAndWireValue("userId"),
                                typeReference: IrVersions.V66.dynamic.TypeReference.primitive("STRING"),
                                propertyAccess: undefined,
                                variable: undefined
                            }
                        ],
                        extends: [],
                        additionalProperties: false
                    })
                },
                endpoints: {
                    endpoint_getUser: {
                        auth: undefined,
                        declaration: {
                            fernFilepath: {
                                allParts: [makeDynamicName("user")],
                                packagePath: [makeDynamicName("user")],
                                file: undefined
                            },
                            name: makeDynamicName("getUser")
                        },
                        location: { method: "GET", path: "/users/{userId}" },
                        request: IrVersions.V66.dynamic.Request.inlined({
                            declaration: {
                                fernFilepath: {
                                    allParts: [makeDynamicName("user")],
                                    packagePath: [makeDynamicName("user")],
                                    file: undefined
                                },
                                name: makeDynamicName("GetUserRequest")
                            },
                            pathParameters: [
                                {
                                    name: makeDynamicNameAndWireValue("userId"),
                                    typeReference: IrVersions.V66.dynamic.TypeReference.primitive("STRING"),
                                    propertyAccess: undefined,
                                    variable: undefined
                                }
                            ],
                            queryParameters: undefined,
                            headers: undefined,
                            body: undefined,
                            metadata: undefined
                        }),
                        response: IrVersions.V66.dynamic.Response.json(),
                        examples: undefined
                    }
                },
                environments: undefined,
                headers: undefined,
                pathParameters: undefined,
                variables: undefined,
                generatorConfig: undefined
            };

            const v66IR = createMinimalV66IR({ dynamic: dynamicIr });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            expect(v65IR.dynamic).toBeDefined();

            // Verify type declaration name passes through correctly
            const userType = v65IR.dynamic?.types["type_User"];
            expect(userType).toBeDefined();
            if (userType?.type === "object") {
                expect(userType.declaration.name.originalName).toBe("User");
                expect(userType.declaration.name.camelCase).toBeDefined();
                expect(userType.declaration.fernFilepath.allParts[0]?.originalName).toBe("user");

                // Verify property NameAndWireValue passes through
                const prop = userType.properties[0];
                expect(prop?.name.wireValue).toBe("userId");
                expect(prop?.name.name.originalName).toBe("userId");
                expect(prop?.name.name.camelCase).toBeDefined();
            }

            // Verify endpoint declaration name passes through
            const endpoint = v65IR.dynamic?.endpoints["endpoint_getUser"];
            expect(endpoint).toBeDefined();
            expect(endpoint?.declaration.name.originalName).toBe("getUser");
            expect(endpoint?.declaration.name.camelCase).toBeDefined();

            // Verify path parameter NameAndWireValue passes through
            if (endpoint?.request.type === "inlined" && endpoint.request.pathParameters != null) {
                const pathParam = endpoint.request.pathParameters[0];
                expect(pathParam?.name.wireValue).toBe("userId");
                expect(pathParam?.name.name.originalName).toBe("userId");
                expect(pathParam?.name.name.camelCase).toBeDefined();
            }
        });

        it("passes through dynamic IR enum type with full NameAndWireValue objects", () => {
            const dynamicIr: IrVersions.V66.dynamic.DynamicIntermediateRepresentation = {
                version: "1.0.0",
                types: {
                    type_Status: IrVersions.V66.dynamic.NamedType.enum({
                        declaration: {
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: makeDynamicName("Status")
                        },
                        values: [makeDynamicNameAndWireValue("ACTIVE"), makeDynamicNameAndWireValue("INACTIVE")]
                    })
                },
                endpoints: {},
                environments: undefined,
                headers: undefined,
                pathParameters: undefined,
                variables: undefined,
                generatorConfig: undefined
            };

            const v66IR = createMinimalV66IR({ dynamic: dynamicIr });
            const v65IR = V66_TO_V65_MIGRATION.migrateBackwards(v66IR, mockContext);

            const statusType = v65IR.dynamic?.types["type_Status"];
            expect(statusType?.type).toBe("enum");
            if (statusType?.type === "enum") {
                expect(statusType.values[0]?.wireValue).toBe("ACTIVE");
                expect(statusType.values[0]?.name.originalName).toBe("ACTIVE");
                expect(statusType.values[0]?.name.camelCase).toBeDefined();
                expect(statusType.values[1]?.wireValue).toBe("INACTIVE");
            }
        });
    });
});
