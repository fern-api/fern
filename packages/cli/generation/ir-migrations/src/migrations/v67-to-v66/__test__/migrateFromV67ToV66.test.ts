import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V67_TO_V66_MIGRATION } from "../migrateFromV67ToV66";

describe("migrateFromV67ToV66", () => {
    const mockContext = {
        taskContext: createMockTaskContext(),
        targetGenerator: {
            name: "test-generator",
            version: "0.0.0"
        }
    };

    const createMinimalV67IR = (
        overrides: Partial<IrVersions.V67.ir.IntermediateRepresentation>
    ): IrVersions.V67.ir.IntermediateRepresentation => {
        return {
            fdrApiDefinitionId: undefined,
            apiVersion: undefined,
            apiName: {
                originalName: "TestApi",
                camelCase: { safeName: "testApi", unsafeName: "testApi" },
                pascalCase: { safeName: "TestApi", unsafeName: "TestApi" },
                snakeCase: { safeName: "test_api", unsafeName: "test_api" },
                screamingSnakeCase: { safeName: "TEST_API", unsafeName: "TEST_API" }
            },
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
                errorInstanceIdKey: {
                    name: {
                        originalName: "errorInstanceId",
                        camelCase: { safeName: "errorInstanceId", unsafeName: "errorInstanceId" },
                        pascalCase: { safeName: "ErrorInstanceId", unsafeName: "ErrorInstanceId" },
                        snakeCase: { safeName: "error_instance_id", unsafeName: "error_instance_id" },
                        screamingSnakeCase: {
                            safeName: "ERROR_INSTANCE_ID",
                            unsafeName: "ERROR_INSTANCE_ID"
                        }
                    },
                    wireValue: "errorInstanceId"
                }
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
            errorDiscriminationStrategy: IrVersions.V67.ErrorDiscriminationStrategy.statusCode(),
            selfHosted: undefined,
            audiences: [],
            generationMetadata: undefined,
            apiPlayground: undefined,
            ...overrides
        } as IrVersions.V67.ir.IntermediateRepresentation;
    };

    const buildTypeWithAvailability = (
        typeId: string,
        status: IrVersions.V67.AvailabilityStatus
    ): IrVersions.V67.TypeDeclaration => ({
        docs: undefined,
        availability: { status, message: undefined },
        name: {
            typeId,
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            name: {
                originalName: typeId,
                camelCase: { safeName: typeId, unsafeName: typeId },
                pascalCase: { safeName: typeId, unsafeName: typeId },
                snakeCase: { safeName: typeId, unsafeName: typeId },
                screamingSnakeCase: { safeName: typeId, unsafeName: typeId }
            },
            displayName: undefined
        },
        shape: IrVersions.V67.Type.alias({
            aliasOf: IrVersions.V67.TypeReference.primitive({ v1: "STRING", v2: undefined }),
            resolvedType: IrVersions.V67.ResolvedTypeReference.primitive({ v1: "STRING", v2: undefined })
        }),
        autogeneratedExamples: [],
        userProvidedExamples: [],
        v2Examples: undefined,
        referencedTypes: new Set<string>(),
        encoding: undefined,
        source: undefined,
        inline: undefined
    });

    describe("availability downcast", () => {
        it.each<[IrVersions.V67.AvailabilityStatus, IrVersions.V66.AvailabilityStatus]>([
            ["IN_DEVELOPMENT", "IN_DEVELOPMENT"],
            ["ALPHA", "IN_DEVELOPMENT"],
            ["PRE_RELEASE", "PRE_RELEASE"],
            ["BETA", "PRE_RELEASE"],
            ["PREVIEW", "PRE_RELEASE"],
            ["GENERAL_AVAILABILITY", "GENERAL_AVAILABILITY"],
            ["DEPRECATED", "DEPRECATED"],
            ["LEGACY", "DEPRECATED"]
        ])("downcasts %s to %s on a TypeDeclaration", (input, expected) => {
            const v67IR = createMinimalV67IR({
                types: {
                    type_Foo: buildTypeWithAvailability("type_Foo", input)
                }
            });

            const v66IR = V67_TO_V66_MIGRATION.migrateBackwards(v67IR, mockContext);

            expect(v66IR.types.type_Foo?.availability?.status).toBe(expected);
        });

        it("preserves Set instances on TypeDeclaration.referencedTypes", () => {
            const referencedTypes = new Set<string>(["type_Bar"]);
            const v67IR = createMinimalV67IR({
                types: {
                    type_Foo: {
                        ...buildTypeWithAvailability("type_Foo", "BETA"),
                        referencedTypes
                    }
                }
            });

            const v66IR = V67_TO_V66_MIGRATION.migrateBackwards(v67IR, mockContext);

            expect(v66IR.types.type_Foo?.referencedTypes).toBeInstanceOf(Set);
            expect(v66IR.types.type_Foo?.referencedTypes.has("type_Bar")).toBe(true);
        });

        it("preserves Date instances embedded in user examples", () => {
            const date = new Date("2024-01-01T00:00:00Z");
            const v67IR = createMinimalV67IR({
                types: {
                    type_Foo: {
                        ...buildTypeWithAvailability("type_Foo", "BETA"),
                        autogeneratedExamples: [
                            {
                                jsonExample: { createdAt: date }
                            } as unknown as IrVersions.V67.ExampleType
                        ]
                    }
                }
            });

            const v66IR = V67_TO_V66_MIGRATION.migrateBackwards(v67IR, mockContext);

            const example = v66IR.types.type_Foo?.autogeneratedExamples?.[0]?.jsonExample as {
                createdAt: Date;
            };
            expect(example.createdAt).toBeInstanceOf(Date);
            expect(example.createdAt.toISOString()).toBe("2024-01-01T00:00:00.000Z");
        });

        it("does not touch availability-shaped objects nested in user jsonExample payloads", () => {
            const v67IR = createMinimalV67IR({
                types: {
                    type_Foo: {
                        ...buildTypeWithAvailability("type_Foo", "BETA"),
                        autogeneratedExamples: [
                            {
                                jsonExample: {
                                    availability: { status: "active", details: "user payload" }
                                }
                            } as unknown as IrVersions.V67.ExampleType
                        ]
                    }
                }
            });

            // The explicit traversal does not descend into user `jsonExample` payloads,
            // so a user-provided `availability.status` field there is left untouched.
            // (Previously a generic recursive walker would have hit this and tripped
            // assertNever on "active".)
            const v66IR = V67_TO_V66_MIGRATION.migrateBackwards(v67IR, mockContext);

            expect(v66IR.types.type_Foo?.availability?.status).toBe("PRE_RELEASE");
            const example = v66IR.types.type_Foo?.autogeneratedExamples?.[0]?.jsonExample as {
                availability?: { status?: string };
            };
            expect(example?.availability?.status).toBe("active");
        });

        it("leaves IRs without any availability values untouched", () => {
            const v67IR = createMinimalV67IR({});
            const v66IR = V67_TO_V66_MIGRATION.migrateBackwards(v67IR, mockContext);
            const apiName = v66IR.apiName;
            const originalName = typeof apiName === "string" ? apiName : apiName.originalName;
            expect(originalName).toBe("TestApi");
        });

        it("downcasts availability on object properties, enum values, and union variants", () => {
            const buildName = (n: string): IrVersions.V67.NameAndWireValueOrString => ({
                wireValue: n,
                name: {
                    originalName: n,
                    camelCase: { safeName: n, unsafeName: n },
                    pascalCase: { safeName: n, unsafeName: n },
                    snakeCase: { safeName: n, unsafeName: n },
                    screamingSnakeCase: { safeName: n, unsafeName: n }
                }
            });
            const objectType: IrVersions.V67.TypeDeclaration = {
                ...buildTypeWithAvailability("type_Obj", "ALPHA"),
                shape: IrVersions.V67.Type.object({
                    extends: [],
                    extendedProperties: undefined,
                    extraProperties: false,
                    properties: [
                        {
                            docs: undefined,
                            availability: { status: "BETA", message: undefined },
                            name: buildName("foo"),
                            valueType: IrVersions.V67.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            propertyAccess: undefined,
                            defaultValue: undefined,
                            v2Examples: undefined
                        }
                    ]
                })
            };
            const enumType: IrVersions.V67.TypeDeclaration = {
                ...buildTypeWithAvailability("type_Enum", "PREVIEW"),
                shape: IrVersions.V67.Type.enum({
                    default: undefined,
                    forwardCompatible: undefined,
                    values: [
                        {
                            docs: undefined,
                            availability: { status: "LEGACY", message: undefined },
                            name: buildName("LEGACY_VALUE")
                        }
                    ]
                })
            };

            const v67IR = createMinimalV67IR({
                types: { type_Obj: objectType, type_Enum: enumType }
            });

            const v66IR = V67_TO_V66_MIGRATION.migrateBackwards(v67IR, mockContext);

            const obj = v66IR.types.type_Obj?.shape;
            const enm = v66IR.types.type_Enum?.shape;
            if (obj?.type !== "object" || enm?.type !== "enum") {
                throw new Error("unexpected shape");
            }
            expect(v66IR.types.type_Obj?.availability?.status).toBe("IN_DEVELOPMENT");
            expect(obj.properties[0]?.availability?.status).toBe("PRE_RELEASE");
            expect(v66IR.types.type_Enum?.availability?.status).toBe("PRE_RELEASE");
            expect(enm.values[0]?.availability?.status).toBe("DEPRECATED");
        });

        it("downcasts availability on apiVersion header and enum values", () => {
            const buildName = (n: string): IrVersions.V67.NameAndWireValueOrString => ({
                wireValue: n,
                name: {
                    originalName: n,
                    camelCase: { safeName: n, unsafeName: n },
                    pascalCase: { safeName: n, unsafeName: n },
                    snakeCase: { safeName: n, unsafeName: n },
                    screamingSnakeCase: { safeName: n, unsafeName: n }
                }
            });
            const v67IR = createMinimalV67IR({
                apiVersion: IrVersions.V67.ApiVersionScheme.header({
                    header: {
                        docs: undefined,
                        availability: { status: "ALPHA", message: undefined },
                        name: buildName("X-API-Version"),
                        valueType: IrVersions.V67.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        env: undefined,
                        v2Examples: undefined
                    } as IrVersions.V67.HttpHeader,
                    value: {
                        default: undefined,
                        values: [
                            {
                                docs: undefined,
                                availability: { status: "LEGACY", message: undefined },
                                name: buildName("v1")
                            }
                        ],
                        forwardCompatible: undefined
                    }
                })
            });

            const v66IR = V67_TO_V66_MIGRATION.migrateBackwards(v67IR, mockContext);

            const scheme = v66IR.apiVersion;
            if (scheme?.type !== "header") {
                throw new Error("expected header scheme");
            }
            expect(scheme.header.availability?.status).toBe("IN_DEVELOPMENT");
            expect(scheme.value.values[0]?.availability?.status).toBe("DEPRECATED");
        });
    });
});
