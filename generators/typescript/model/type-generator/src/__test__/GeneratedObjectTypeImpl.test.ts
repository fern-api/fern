import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, TypeReferenceNode } from "@fern-typescript/commons";
import {
    caseConverter,
    casingsGenerator,
    createDeclaredTypeName,
    createNameAndWireValue,
    createObjectProperty,
    optionalTypeRefNode,
    primitiveTypeRefNode,
    readWriteTypeRefNode
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { GeneratedObjectTypeImpl } from "../object/GeneratedObjectTypeImpl.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Creates a FernFilepath for test use.
 */
function createFernFilepath(): FernIr.FernFilepath {
    return {
        allParts: [casingsGenerator.generateName("types")],
        packagePath: [casingsGenerator.generateName("types")],
        file: casingsGenerator.generateName("types")
    };
}

/**
 * Creates a mock BaseContext for object type tests.
 * The type mock provides getReferenceToInlinePropertyType, getReferenceToNamedType,
 * getReferenceToType, getReferenceToTypeForInlineUnion, getTypeDeclaration,
 * getGeneratedType, getGeneratedExample, and typeNameToTypeReference.
 */
function createMockBaseContext(opts?: {
    typeRefOverrides?: Map<string, TypeReferenceNode>;
    namedTypeRefOverrides?: Map<string, string>;
    typeDeclarationOverrides?: Map<string, FernIr.TypeDeclaration>;
    generatedTypeOverrides?: Map<string, unknown>;
}) {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");

    const typeRefMap = opts?.typeRefOverrides ?? new Map<string, TypeReferenceNode>();
    const namedTypeMap = opts?.namedTypeRefOverrides ?? new Map<string, string>();
    const typeDeclMap = opts?.typeDeclarationOverrides ?? new Map<string, FernIr.TypeDeclaration>();
    const generatedTypeMap = opts?.generatedTypeOverrides ?? new Map<string, unknown>();

    return {
        sourceFile,
        // biome-ignore lint/suspicious/noEmptyBlockStatements: test mock with no-op logger
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        type: {
            getReferenceToInlinePropertyType: (
                typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                _propertyName: string
            ): TypeReferenceNode => {
                // Check if there's a named type with an override
                if (typeRef.type === "named") {
                    const override = typeRefMap.get(typeRef.typeId);
                    if (override) {
                        return override;
                    }
                }
                // Check for optional wrapping
                if (typeRef.type === "container" && typeRef.container.type === "optional") {
                    const inner = typeRef.container.optional;
                    if (inner.type === "named") {
                        const override = typeRefMap.get(inner.typeId);
                        if (override) {
                            return {
                                ...override,
                                isOptional: true,
                                typeNode: ts.factory.createUnionTypeNode([
                                    override.typeNodeWithoutUndefined,
                                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                ])
                            };
                        }
                    }
                    return optionalTypeRefNode("string");
                }
                // Default: return primitive string type ref
                return primitiveTypeRefNode("string");
            },
            getReferenceToNamedType: (typeName: FernIr.DeclaredTypeName) => {
                const overrideName = namedTypeMap.get(typeName.typeId);
                const refName = overrideName ?? caseConverter.pascalSafe(typeName.name);
                return {
                    getTypeNode: () => ts.factory.createTypeReferenceNode(refName),
                    getExpression: () => ts.factory.createIdentifier(refName),
                    getEntityName: () => ts.factory.createIdentifier(refName)
                };
            },
            getReferenceToTypeForInlineUnion: (typeRef: FernIr.TypeReference): TypeReferenceNode => {
                if (typeRef.type === "named") {
                    const override = typeRefMap.get(typeRef.typeId);
                    if (override) {
                        return override;
                    }
                }
                return primitiveTypeRefNode("string");
            },
            getReferenceToType: (typeRef: FernIr.TypeReference): TypeReferenceNode => {
                if (typeRef.type === "named") {
                    const override = typeRefMap.get(typeRef.typeId);
                    if (override) {
                        return override;
                    }
                }
                return primitiveTypeRefNode("string");
            },
            typeNameToTypeReference: (typeName: FernIr.DeclaredTypeName): FernIr.TypeReference => {
                return FernIr.TypeReference.named({
                    typeId: typeName.typeId,
                    fernFilepath: typeName.fernFilepath,
                    name: typeName.name,
                    displayName: typeName.displayName,
                    default: undefined,
                    inline: undefined
                });
            },
            getTypeDeclaration: (typeName: FernIr.DeclaredTypeName): FernIr.TypeDeclaration => {
                const override = typeDeclMap.get(typeName.typeId);
                if (override) {
                    return override;
                }
                return {
                    name: typeName,
                    shape: FernIr.Type.object({
                        properties: [],
                        extends: [],
                        extraProperties: false,
                        extendedProperties: undefined
                    }),
                    referencedTypes: new Set<string>(),
                    encoding: undefined,
                    autogeneratedExamples: [],
                    userProvidedExamples: [],
                    v2Examples: undefined,
                    docs: undefined,
                    availability: undefined,
                    source: undefined,
                    inline: undefined
                };
            },
            getGeneratedType: (typeName: FernIr.DeclaredTypeName, _typeNameOverride?: string) => {
                const override = generatedTypeMap.get(typeName.typeId);
                if (override) {
                    return override;
                }
                return {
                    type: "object",
                    generateStatements: () => [],
                    getAllPropertiesIncludingExtensions: () => [],
                    getPropertyKey: ({ propertyWireKey }: { propertyWireKey: string }) => propertyWireKey
                };
            },
            getGeneratedExample: (example: FernIr.ExampleTypeReference) => ({
                build: () => ts.factory.createStringLiteral("example-value")
            })
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates an ObjectProperty with propertyAccess field for read/write-only tests.
 */
function createObjectPropertyWithAccess(
    name: string,
    valueType: FernIr.TypeReference,
    access: "READ_ONLY" | "WRITE_ONLY" | undefined,
    opts?: { wireValue?: string }
): FernIr.ObjectProperty {
    const prop = createObjectProperty(name, valueType, { wireValue: opts?.wireValue });
    return {
        ...prop,
        // biome-ignore lint/suspicious/noExplicitAny: propertyAccess accepts string union but ObjectPropertyAccess type may not be exported
        propertyAccess: access as any
    };
}

/**
 * Creates a GeneratedObjectTypeImpl with the given config.
 */
function createObjectGenerator(opts: {
    typeName: string;
    properties?: FernIr.ObjectProperty[];
    extends?: FernIr.DeclaredTypeName[];
    extraProperties?: boolean;
    extendedProperties?: FernIr.ObjectProperty[];
    includeSerdeLayer?: boolean;
    noOptionalProperties?: boolean;
    retainOriginalCasing?: boolean;
    enableInlineTypes?: boolean;
    generateReadWriteOnlyTypes?: boolean;
    docs?: string;
    examples?: FernIr.ExampleType[];
    // biome-ignore lint/suspicious/noExplicitAny: test factory with generic type parameter
}): GeneratedObjectTypeImpl<any> {
    return new GeneratedObjectTypeImpl({
        typeName: opts.typeName,
        shape: {
            properties: opts.properties ?? [],
            extends: opts.extends ?? [],
            extraProperties: opts.extraProperties ?? false,
            extendedProperties: opts.extendedProperties
        },
        examples: opts.examples ?? [],
        docs: opts.docs,
        fernFilepath: createFernFilepath(),
        getReferenceToSelf: () => ({
            getTypeNode: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getExpression: () => ts.factory.createIdentifier(opts.typeName),
            getEntityName: () => ts.factory.createIdentifier(opts.typeName)
        }),
        includeSerdeLayer: opts.includeSerdeLayer ?? true,
        noOptionalProperties: opts.noOptionalProperties ?? false,
        retainOriginalCasing: opts.retainOriginalCasing ?? false,
        enableInlineTypes: opts.enableInlineTypes ?? false,
        generateReadWriteOnlyTypes: opts.generateReadWriteOnlyTypes ?? false,
        caseConverter
    });
}

/**
 * Serializes generateStatements output by writing to a ts-morph SourceFile.
 */
function serializeStatements(
    // biome-ignore lint/suspicious/noExplicitAny: test utility with generic type parameter
    generator: GeneratedObjectTypeImpl<any>,
    // biome-ignore lint/suspicious/noExplicitAny: test utility accepting mock context
    context?: any
): string {
    const ctx = context ?? createMockBaseContext();
    const statements = generator.generateStatements(ctx);
    ctx.sourceFile.addStatements(statements);
    return ctx.sourceFile.getFullText();
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("GeneratedObjectTypeImpl", () => {
    describe("generateStatements / writeToFile", () => {
        it("generates interface with a single required string property", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with multiple required properties of different types", () => {
            const context = createMockBaseContext({
                typeRefOverrides: new Map([
                    // Map "number" type refs
                ])
            });

            // Override getReferenceToInlinePropertyType to return correct types per property.
            // Keys must be PascalCase because the source passes property.name.name.pascalCase.safeName.
            const typeMap: Record<string, TypeReferenceNode> = {
                Name: primitiveTypeRefNode("string"),
                Age: primitiveTypeRefNode("number"),
                Active: primitiveTypeRefNode("boolean")
            };
            context.type.getReferenceToInlinePropertyType = (
                _typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                propertyName: string
            ) => {
                return typeMap[propertyName] ?? primitiveTypeRefNode("string");
            };

            const generator = createObjectGenerator({
                typeName: "UserProfile",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty("age", FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined })),
                    createObjectProperty("active", FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined }))
                ]
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with optional properties (includeSerdeLayer=true)", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                _propertyName: string
            ) => {
                if (typeRef.type === "container" && typeRef.container.type === "optional") {
                    return optionalTypeRefNode("string");
                }
                return primitiveTypeRefNode("string");
            };

            const generator = createObjectGenerator({
                typeName: "ObjectWithOptionalField",
                properties: [
                    createObjectProperty(
                        "optionalField",
                        FernIr.TypeReference.container(
                            FernIr.ContainerType.optional(
                                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                            )
                        )
                    ),
                    createObjectProperty(
                        "requiredField",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    )
                ],
                includeSerdeLayer: true
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with optional properties (includeSerdeLayer=false adds | undefined)", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                _propertyName: string
            ) => {
                if (typeRef.type === "container" && typeRef.container.type === "optional") {
                    return optionalTypeRefNode("string");
                }
                return primitiveTypeRefNode("string");
            };

            const generator = createObjectGenerator({
                typeName: "ObjectWithOptionalField",
                properties: [
                    createObjectProperty(
                        "optionalField",
                        FernIr.TypeReference.container(
                            FernIr.ContainerType.optional(
                                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                            )
                        )
                    ),
                    createObjectProperty(
                        "requiredField",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    )
                ],
                includeSerdeLayer: false
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with extends clause", () => {
            const parentType = createDeclaredTypeName("ParentType");

            const context = createMockBaseContext({
                namedTypeRefOverrides: new Map([[parentType.typeId, "ParentType"]])
            });

            const generator = createObjectGenerator({
                typeName: "ChildObject",
                properties: [
                    createObjectProperty("childProp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                extends: [parentType]
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with multiple extends", () => {
            const parentA = createDeclaredTypeName("BaseA");
            const parentB = createDeclaredTypeName("BaseB");

            const context = createMockBaseContext({
                namedTypeRefOverrides: new Map([
                    [parentA.typeId, "BaseA"],
                    [parentB.typeId, "BaseB"]
                ])
            });

            const generator = createObjectGenerator({
                typeName: "Combined",
                properties: [
                    createObjectProperty("ownProp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                extends: [parentA, parentB]
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with extra properties (index signature)", () => {
            const generator = createObjectGenerator({
                typeName: "FlexibleObject",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                extraProperties: true
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with docs on properties", () => {
            const generator = createObjectGenerator({
                typeName: "DocumentedObject",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                        docs: "The name of the object."
                    }),
                    createObjectProperty("value", FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }), {
                        docs: "The numeric value."
                    })
                ]
            });

            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                _typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                propertyName: string
            ) => {
                if (propertyName === "Value") {
                    return primitiveTypeRefNode("number");
                }
                return primitiveTypeRefNode("string");
            };

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with top-level docs", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("id", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                docs: "Represents a custom object type."
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with retainOriginalCasing (uses wire values as property keys)", () => {
            const generator = createObjectGenerator({
                typeName: "CasedObject",
                properties: [
                    createObjectProperty(
                        "myProperty",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        {
                            wireValue: "my_property"
                        }
                    ),
                    createObjectProperty(
                        "anotherField",
                        FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                        {
                            wireValue: "another-field"
                        }
                    )
                ],
                retainOriginalCasing: true,
                includeSerdeLayer: false
            });

            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                _typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                propertyName: string
            ) => {
                if (propertyName === "AnotherField") {
                    return primitiveTypeRefNode("number");
                }
                return primitiveTypeRefNode("string");
            };

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with includeSerdeLayer=true (uses camelCase property keys)", () => {
            const generator = createObjectGenerator({
                typeName: "CasedObject",
                properties: [
                    createObjectProperty(
                        "myProperty",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        {
                            wireValue: "my_property"
                        }
                    ),
                    createObjectProperty(
                        "anotherField",
                        FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                        {
                            wireValue: "another-field"
                        }
                    )
                ],
                includeSerdeLayer: true,
                retainOriginalCasing: false
            });

            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                _typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                propertyName: string
            ) => {
                if (propertyName === "AnotherField") {
                    return primitiveTypeRefNode("number");
                }
                return primitiveTypeRefNode("string");
            };

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates interface with noOptionalProperties (optional types become required with full union)", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                _propertyName: string
            ) => {
                if (typeRef.type === "container" && typeRef.container.type === "optional") {
                    return optionalTypeRefNode("string");
                }
                return primitiveTypeRefNode("string");
            };

            const generator = createObjectGenerator({
                typeName: "StrictObject",
                properties: [
                    createObjectProperty(
                        "optionalField",
                        FernIr.TypeReference.container(
                            FernIr.ContainerType.optional(
                                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                            )
                        )
                    ),
                    createObjectProperty(
                        "requiredField",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    )
                ],
                noOptionalProperties: true
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });
    });

    describe("generateInterface", () => {
        it("returns InterfaceDeclarationStructure with correct name and properties", () => {
            const generator = createObjectGenerator({
                typeName: "SimpleInterface",
                properties: [
                    createObjectProperty("id", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty("count", FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }))
                ]
            });

            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                _typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                propertyName: string
            ) => {
                if (propertyName === "Count") {
                    return primitiveTypeRefNode("number");
                }
                return primitiveTypeRefNode("string");
            };

            const iface = generator.generateInterface(context);
            expect(iface.name).toBe("SimpleInterface");
            expect(iface.isExported).toBe(true);
            expect(iface.properties?.length).toBe(2);
        });
    });

    describe("generateForInlineUnion", () => {
        it("generates type literal for inline union with required properties", () => {
            const generator = createObjectGenerator({
                typeName: "InlinedObject",
                properties: [
                    createObjectProperty("field", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });

            const context = createMockBaseContext();
            const result = generator.generateForInlineUnion(context);
            const text = getTextOfTsNode(result.typeNode);
            expect(text).toMatchSnapshot();
            expect(result.requestTypeNode).toBeUndefined();
            expect(result.responseTypeNode).toBeUndefined();
        });

        it("generates type literal with optional properties for inline union", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                _propertyName: string
            ) => {
                if (typeRef.type === "container" && typeRef.container.type === "optional") {
                    return optionalTypeRefNode("string");
                }
                return primitiveTypeRefNode("string");
            };

            const generator = createObjectGenerator({
                typeName: "InlinedOptional",
                properties: [
                    createObjectProperty("required", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty(
                        "optional",
                        FernIr.TypeReference.container(
                            FernIr.ContainerType.optional(
                                FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                            )
                        )
                    )
                ]
            });

            const result = generator.generateForInlineUnion(context);
            const text = getTextOfTsNode(result.typeNode);
            expect(text).toMatchSnapshot();
        });

        it("generates request/response type nodes when generateReadWriteOnlyTypes is true", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = () => primitiveTypeRefNode("string");

            const generator = createObjectGenerator({
                typeName: "ReadWriteObject",
                properties: [
                    createObjectPropertyWithAccess(
                        "readProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "READ_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "writeProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "WRITE_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "bothProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        undefined
                    )
                ],
                generateReadWriteOnlyTypes: true
            });

            const result = generator.generateForInlineUnion(context);
            expect(getTextOfTsNode(result.typeNode)).toMatchSnapshot();
            // Request type should filter out read-only properties
            assert(result.requestTypeNode != null, "expected request type node to be generated");
            expect(getTextOfTsNode(result.requestTypeNode)).toMatchSnapshot();
            // Response type should filter out write-only properties
            assert(result.responseTypeNode != null, "expected response type node to be generated");
            expect(getTextOfTsNode(result.responseTypeNode)).toMatchSnapshot();
        });
    });

    describe("generateModule", () => {
        it("returns undefined when no module content is needed", () => {
            const generator = createObjectGenerator({
                typeName: "PlainObject",
                properties: [
                    createObjectProperty("field", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });

            const context = createMockBaseContext();
            const module = generator.generateModule(context);
            expect(module).toBeUndefined();
        });

        it("generates namespace module with Request/Response types when generateReadWriteOnlyTypes is true", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = () => primitiveTypeRefNode("string");
            context.type.getReferenceToType = () => ({
                ...primitiveTypeRefNode("string"),
                requestTypeNode: undefined,
                responseTypeNode: undefined
            });

            const generator = createObjectGenerator({
                typeName: "ReadWriteObject",
                properties: [
                    createObjectPropertyWithAccess(
                        "readProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "READ_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "writeProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "WRITE_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "normalProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        undefined
                    )
                ],
                generateReadWriteOnlyTypes: true
            });

            const ctx = context;
            const module = generator.generateModule(ctx);
            assert(module != null, "expected generateModule to return a module declaration");
            ctx.sourceFile.addModule(module);
            expect(ctx.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates namespace module with Request type using separate request type variant", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                _typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                propertyName: string
            ) => {
                if (propertyName === "TypedProp") {
                    return readWriteTypeRefNode({
                        baseType: "SharedType",
                        requestType: "RequestSharedType"
                    });
                }
                return primitiveTypeRefNode("string");
            };
            context.type.getReferenceToType = () => ({
                ...primitiveTypeRefNode("string"),
                requestTypeNode: undefined,
                responseTypeNode: undefined
            });

            const generator = createObjectGenerator({
                typeName: "TypedObject",
                properties: [
                    createObjectProperty("typedProp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty("plainProp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                generateReadWriteOnlyTypes: true
            });

            const module = generator.generateModule(context);
            assert(module != null, "expected generateModule to return a module declaration");
            context.sourceFile.addModule(module);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates inline type module statements when enableInlineTypes is true", () => {
            const inlineTypeName = createDeclaredTypeName("InlineChild");
            const context = createMockBaseContext({
                typeDeclarationOverrides: new Map([
                    [
                        inlineTypeName.typeId,
                        {
                            name: inlineTypeName,
                            shape: FernIr.Type.object({
                                properties: [],
                                extends: [],
                                extraProperties: false,
                                extendedProperties: undefined
                            }),
                            referencedTypes: new Set<string>(),
                            encoding: undefined,
                            autogeneratedExamples: [],
                            userProvidedExamples: [],
                            v2Examples: undefined,
                            docs: undefined,
                            availability: undefined,
                            source: undefined,
                            inline: true
                        }
                    ]
                ]),
                generatedTypeOverrides: new Map([
                    [
                        inlineTypeName.typeId,
                        {
                            type: "object",
                            generateStatements: () => ["export interface InlineChild { value: string; }"]
                        }
                    ]
                ])
            });

            const generator = createObjectGenerator({
                typeName: "ParentObject",
                properties: [
                    createObjectProperty(
                        "child",
                        FernIr.TypeReference.named({
                            typeId: inlineTypeName.typeId,
                            fernFilepath: inlineTypeName.fernFilepath,
                            name: inlineTypeName.name,
                            displayName: undefined,
                            default: undefined,
                            inline: undefined
                        })
                    )
                ],
                enableInlineTypes: true
            });

            const ctx = context;
            const statements = generator.generateStatements(ctx);
            ctx.sourceFile.addStatements(statements);
            expect(ctx.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("getPropertyKey", () => {
        it("returns property key for wire value match", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("myField", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                        wireValue: "my_field"
                    })
                ],
                includeSerdeLayer: true,
                retainOriginalCasing: false
            });

            const key = generator.getPropertyKey({ propertyWireKey: "my_field" });
            // includeSerdeLayer && !retainOriginalCasing → camelCase.unsafeName
            expect(key).toBe("myField");
        });

        it("returns wire value when retainOriginalCasing is true", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("myField", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                        wireValue: "my_field"
                    })
                ],
                includeSerdeLayer: true,
                retainOriginalCasing: true
            });

            const key = generator.getPropertyKey({ propertyWireKey: "my_field" });
            expect(key).toBe("my_field");
        });

        it("returns wire value when includeSerdeLayer is false", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("myField", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                        wireValue: "my_field"
                    })
                ],
                includeSerdeLayer: false
            });

            const key = generator.getPropertyKey({ propertyWireKey: "my_field" });
            expect(key).toBe("my_field");
        });

        it("throws for non-existent wire key", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("field", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });

            expect(() => generator.getPropertyKey({ propertyWireKey: "nonexistent" })).toThrow(
                "Property does not exist: nonexistent"
            );
        });

        it("finds property from extended properties via wire key", () => {
            const generator = createObjectGenerator({
                typeName: "ExtendedObject",
                properties: [],
                extendedProperties: [
                    createObjectProperty("inherited", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                        wireValue: "inherited_field"
                    })
                ],
                includeSerdeLayer: true,
                retainOriginalCasing: false
            });

            const key = generator.getPropertyKey({ propertyWireKey: "inherited_field" });
            expect(key).toBe("inherited");
        });
    });

    describe("getAllPropertiesIncludingExtensions", () => {
        it("returns own properties", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty("age", FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }))
                ],
                includeSerdeLayer: true
            });

            const context = createMockBaseContext();
            const props = generator.getAllPropertiesIncludingExtensions(context);
            expect(props).toHaveLength(2);
            expect(props[0]?.propertyKey).toBe("name");
            expect(props[1]?.propertyKey).toBe("age");
        });

        it("includes properties from extended types", () => {
            const parentType = createDeclaredTypeName("ParentType");

            const context = createMockBaseContext({
                generatedTypeOverrides: new Map([
                    [
                        parentType.typeId,
                        {
                            type: "object",
                            getAllPropertiesIncludingExtensions: () => [
                                {
                                    propertyKey: "parentProp",
                                    wireKey: "parent_prop",
                                    type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                                }
                            ]
                        }
                    ]
                ])
            });

            const generator = createObjectGenerator({
                typeName: "ChildObject",
                properties: [
                    createObjectProperty("childProp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                extends: [parentType],
                includeSerdeLayer: true
            });

            const props = generator.getAllPropertiesIncludingExtensions(context);
            expect(props).toHaveLength(2);
            expect(props[0]?.propertyKey).toBe("childProp");
            expect(props[1]?.propertyKey).toBe("parentProp");
        });

        it("uses forceCamelCase when specified", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("myField", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                        wireValue: "my_field"
                    })
                ],
                includeSerdeLayer: false,
                retainOriginalCasing: true
            });

            const context = createMockBaseContext();

            // Without forceCamelCase: uses retainOriginalCasing → wire value
            const propsDefault = generator.getAllPropertiesIncludingExtensions(context);
            expect(propsDefault[0]?.propertyKey).toBe("my_field");

            // With forceCamelCase: always uses camelCase.safeName
            const propsCamel = generator.getAllPropertiesIncludingExtensions(context, { forceCamelCase: true });
            expect(propsCamel[0]?.propertyKey).toBe("myField");
        });
    });

    describe("buildExample", () => {
        it("builds example for object type", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });

            const context = createMockBaseContext();
            const exampleProps: FernIr.ExampleObjectProperty[] = [
                {
                    name: createNameAndWireValue("name"),
                    value: {
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "test-name" })
                        ),
                        jsonExample: "test-name"
                    },
                    originalTypeDeclaration: createDeclaredTypeName("MyObject"),
                    propertyAccess: undefined
                }
            ];
            const example: FernIr.ExampleTypeShape = FernIr.ExampleTypeShape.object({
                properties: exampleProps,
                extraProperties: undefined
            });

            const result = generator.buildExample(example, context, {
                isForComment: true,
                isForTypeDeclarationComment: true
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("filters out read-only properties when isForRequest is true", () => {
            const generator = createObjectGenerator({
                typeName: "RWExample",
                properties: [
                    createObjectPropertyWithAccess(
                        "readProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "READ_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "writeProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "WRITE_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "normalProp",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        undefined
                    )
                ],
                generateReadWriteOnlyTypes: true
            });

            const context = createMockBaseContext();
            const exampleProps: FernIr.ExampleObjectProperty[] = [
                {
                    name: createNameAndWireValue("readProp"),
                    value: {
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "read-value" })
                        ),
                        jsonExample: "read-value"
                    },
                    originalTypeDeclaration: createDeclaredTypeName("RWExample"),
                    propertyAccess: "READ_ONLY" as FernIr.ObjectPropertyAccess
                },
                {
                    name: createNameAndWireValue("writeProp"),
                    value: {
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "write-value" })
                        ),
                        jsonExample: "write-value"
                    },
                    originalTypeDeclaration: createDeclaredTypeName("RWExample"),
                    propertyAccess: "WRITE_ONLY" as FernIr.ObjectPropertyAccess
                },
                {
                    name: createNameAndWireValue("normalProp"),
                    value: {
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "normal-value" })
                        ),
                        jsonExample: "normal-value"
                    },
                    originalTypeDeclaration: createDeclaredTypeName("RWExample"),
                    propertyAccess: undefined
                }
            ];
            const example = FernIr.ExampleTypeShape.object({
                properties: exampleProps,
                extraProperties: undefined
            });

            // isForRequest=true should filter out READ_ONLY properties
            const requestResult = generator.buildExample(example, context, {
                isForComment: false,
                isForRequest: true
            });
            const requestText = getTextOfTsNode(requestResult);
            expect(requestText).toMatchSnapshot();

            // isForResponse=true should filter out WRITE_ONLY properties
            const responseResult = generator.buildExample(example, context, {
                isForComment: false,
                isForResponse: true
            });
            const responseText = getTextOfTsNode(responseResult);
            expect(responseText).toMatchSnapshot();
        });

        it("includes extra properties in example", () => {
            const generator = createObjectGenerator({
                typeName: "ExtraPropsObj",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });

            const context = createMockBaseContext();
            const exampleProps: FernIr.ExampleObjectProperty[] = [
                {
                    name: createNameAndWireValue("name"),
                    value: {
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "test" })
                        ),
                        jsonExample: "test"
                    },
                    originalTypeDeclaration: createDeclaredTypeName("ExtraPropsObj"),
                    propertyAccess: undefined
                }
            ];
            const extraProps: FernIr.ExampleObjectProperty[] = [
                {
                    name: createNameAndWireValue("extraField", "extra_field"),
                    value: {
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "extra-value" })
                        ),
                        jsonExample: "extra-value"
                    },
                    originalTypeDeclaration: createDeclaredTypeName("ExtraPropsObj"),
                    propertyAccess: undefined
                }
            ];
            const example = FernIr.ExampleTypeShape.object({
                properties: exampleProps,
                extraProperties: extraProps
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("gracefully handles property key lookup failure via logger.debug", () => {
            const generator = createObjectGenerator({
                typeName: "MismatchObj",
                properties: [
                    createObjectProperty("field", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });

            const debugMessages: string[] = [];
            const context = createMockBaseContext();
            context.logger.debug = (msg: string) => {
                debugMessages.push(msg);
            };
            // Override getGeneratedType to return an object that throws on getPropertyKey
            context.type.getGeneratedType = () => ({
                type: "object",
                getPropertyKey: () => {
                    throw new Error("Wire key not found");
                },
                getAllPropertiesIncludingExtensions: () => [],
                generateStatements: () => []
            });

            const exampleProps: FernIr.ExampleObjectProperty[] = [
                {
                    name: createNameAndWireValue("missingField", "missing_wire"),
                    value: {
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "val" })
                        ),
                        jsonExample: "val"
                    },
                    originalTypeDeclaration: createDeclaredTypeName("MismatchObj"),
                    propertyAccess: undefined
                }
            ];
            const example = FernIr.ExampleTypeShape.object({
                properties: exampleProps,
                extraProperties: undefined
            });

            // Should not throw — catches error and logs debug message
            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toBe("{}");
            expect(debugMessages).toHaveLength(1);
            expect(debugMessages[0]).toContain("missing_wire");
        });

        it("throws for non-object example shape", () => {
            const generator = createObjectGenerator({
                typeName: "MyObject",
                properties: []
            });

            const context = createMockBaseContext();
            const example = FernIr.ExampleTypeShape.enum({
                value: createNameAndWireValue("SomeValue", "some_value")
            });
            expect(() => generator.buildExample(example, context, { isForComment: true })).toThrow(
                "Example is not for an object"
            );
        });
    });

    describe("generateProperties", () => {
        it("returns property structures with docs", () => {
            const generator = createObjectGenerator({
                typeName: "DocObject",
                properties: [
                    createObjectProperty("field", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                        docs: "A documented field"
                    })
                ]
            });

            const context = createMockBaseContext();
            const props = generator.generateProperties(context);
            expect(props).toHaveLength(1);
            expect(props[0]?.property.name).toBe("field");
            expect(props[0]?.property.docs).toEqual([{ description: "A documented field" }]);
            expect(props[0]?.property.hasQuestionToken).toBe(false);
        });

        it("returns request/response property variants when generateReadWriteOnlyTypes is true", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = (
                _typeRef: FernIr.TypeReference,
                _parentTypeName: string,
                propertyName: string
            ) => {
                if (propertyName === "RwProp") {
                    return readWriteTypeRefNode({
                        baseType: "SharedType",
                        requestType: "RequestType",
                        responseType: "ResponseType"
                    });
                }
                return primitiveTypeRefNode("string");
            };

            const generator = createObjectGenerator({
                typeName: "RWObject",
                properties: [
                    createObjectProperty("rwProp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty("normalProp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                generateReadWriteOnlyTypes: true
            });

            const props = generator.generateProperties(context);
            expect(props).toHaveLength(2);

            // rwProp should have request and response variants
            expect(props[0]?.requestProperty).not.toBeUndefined();
            expect(props[0]?.responseProperty).not.toBeUndefined();
            expect(props[0]?.requestProperty?.type).toBe("RequestType");
            expect(props[0]?.responseProperty?.type).toBe("ResponseType");

            // When generateReadWriteOnlyTypes is true, requestType/responseType are always set
            // for all properties (even "normal" ones), using the base type as fallback.
            expect(props[1]?.requestProperty).not.toBeUndefined();
            expect(props[1]?.responseProperty).not.toBeUndefined();
        });

        it("marks read-only and write-only properties correctly", () => {
            const context = createMockBaseContext();
            context.type.getReferenceToInlinePropertyType = () => primitiveTypeRefNode("string");

            const generator = createObjectGenerator({
                typeName: "AccessObject",
                properties: [
                    createObjectPropertyWithAccess(
                        "readOnly",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "READ_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "writeOnly",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        "WRITE_ONLY"
                    ),
                    createObjectPropertyWithAccess(
                        "normal",
                        FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        undefined
                    )
                ],
                generateReadWriteOnlyTypes: true
            });

            const props = generator.generateProperties(context);
            expect(props[0]?.isReadonly).toBe(true);
            expect(props[0]?.isWriteonly).toBe(false);
            expect(props[1]?.isReadonly).toBe(false);
            expect(props[1]?.isWriteonly).toBe(true);
            expect(props[2]?.isReadonly).toBe(false);
            expect(props[2]?.isWriteonly).toBe(false);
        });
    });
});
