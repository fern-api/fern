import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, TypeReferenceNode } from "@fern-typescript/commons";
import { casingsGenerator, createDeclaredTypeName, createNameAndWireValue } from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { GeneratedUnionTypeImpl } from "../union/GeneratedUnionTypeImpl.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function createFernFilepath(packageName = "types"): FernIr.FernFilepath {
    return {
        allParts: [casingsGenerator.generateName(packageName)],
        packagePath: [casingsGenerator.generateName(packageName)],
        file: casingsGenerator.generateName(packageName)
    };
}

/**
 * Builds a TypeReferenceNode for a primitive type (non-optional).
 */
function primitiveTypeRefNode(typeName: string): TypeReferenceNode {
    const typeNode = ts.factory.createKeywordTypeNode(
        typeName === "string"
            ? ts.SyntaxKind.StringKeyword
            : typeName === "number"
              ? ts.SyntaxKind.NumberKeyword
              : typeName === "boolean"
                ? ts.SyntaxKind.BooleanKeyword
                : ts.SyntaxKind.AnyKeyword
    );
    return {
        isOptional: false,
        typeNode,
        typeNodeWithoutUndefined: typeNode,
        requestTypeNode: undefined,
        requestTypeNodeWithoutUndefined: undefined,
        responseTypeNode: undefined,
        responseTypeNodeWithoutUndefined: undefined
    };
}

/**
 * Builds a TypeReferenceNode pointing to a named type reference.
 */
function namedTypeRefNode(name: string): TypeReferenceNode {
    const typeNode = ts.factory.createTypeReferenceNode(name);
    return {
        isOptional: false,
        typeNode,
        typeNodeWithoutUndefined: typeNode,
        requestTypeNode: undefined,
        requestTypeNodeWithoutUndefined: undefined,
        responseTypeNode: undefined,
        responseTypeNodeWithoutUndefined: undefined
    };
}

/**
 * Creates a NameAndWireValue using the casings generator.
 */
function createNameAndWireValueFromName(name: string, wireValue?: string): FernIr.NameAndWireValue {
    return createNameAndWireValue(name, wireValue);
}

/**
 * Creates a SingleUnionType with singleProperty shape.
 */
function createSinglePropertyUnionType(opts: {
    discriminantValue: string;
    propertyName: string;
    propertyWireValue?: string;
    propertyType?: FernIr.TypeReference;
    docs?: string;
}): FernIr.SingleUnionType {
    return {
        discriminantValue: createNameAndWireValueFromName(opts.discriminantValue),
        shape: FernIr.SingleUnionTypeProperties.singleProperty({
            name: createNameAndWireValueFromName(opts.propertyName, opts.propertyWireValue),
            type: opts.propertyType ?? FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
        }),
        displayName: undefined,
        availability: undefined,
        docs: opts.docs
    };
}

/**
 * Creates a SingleUnionType with samePropertiesAsObject shape.
 */
function createSamePropertiesAsObjectUnionType(opts: {
    discriminantValue: string;
    typeName: FernIr.DeclaredTypeName;
    docs?: string;
}): FernIr.SingleUnionType {
    return {
        discriminantValue: createNameAndWireValueFromName(opts.discriminantValue),
        shape: FernIr.SingleUnionTypeProperties.samePropertiesAsObject(opts.typeName),
        displayName: undefined,
        availability: undefined,
        docs: opts.docs
    };
}

/**
 * Creates a SingleUnionType with noProperties shape.
 */
function createNoPropertiesUnionType(opts: { discriminantValue: string; docs?: string }): FernIr.SingleUnionType {
    return {
        discriminantValue: createNameAndWireValueFromName(opts.discriminantValue),
        shape: FernIr.SingleUnionTypeProperties.noProperties(),
        displayName: undefined,
        availability: undefined,
        docs: opts.docs
    };
}

/**
 * Creates a UnionTypeDeclaration IR object.
 */
function createUnionDeclaration(opts: {
    discriminantName: string;
    discriminantWireValue?: string;
    types: FernIr.SingleUnionType[];
    baseProperties?: FernIr.ObjectProperty[];
    extends?: FernIr.DeclaredTypeName[];
}): FernIr.UnionTypeDeclaration {
    return {
        discriminant: createNameAndWireValueFromName(opts.discriminantName, opts.discriminantWireValue),
        types: opts.types,
        baseProperties: opts.baseProperties ?? [],
        extends: opts.extends ?? [],
        discriminatorContext: undefined
    };
}

/**
 * Creates a mock BaseContext for union type tests.
 * Provides: getReferenceToType, getReferenceToTypeForInlineUnion, getReferenceToNamedType,
 * getTypeDeclaration, getGeneratedType, getGeneratedTypeById, getGeneratedExample,
 * needsRequestResponseTypeVariantByType, needsRequestResponseTypeVariantById, typeNameToTypeReference.
 */
function createMockBaseContext(opts?: {
    typeRefOverrides?: Map<string, TypeReferenceNode>;
    generatedTypeOverrides?: Map<string, unknown>;
    generatedTypeByIdOverrides?: Map<string, unknown>;
}) {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");

    const typeRefMap = opts?.typeRefOverrides ?? new Map<string, TypeReferenceNode>();
    const generatedTypeMap = opts?.generatedTypeOverrides ?? new Map<string, unknown>();
    const generatedTypeByIdMap = opts?.generatedTypeByIdOverrides ?? new Map<string, unknown>();

    return {
        sourceFile,
        // biome-ignore lint/suspicious/noEmptyBlockStatements: test mock with no-op logger
        logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        type: {
            getReferenceToType: (typeRef: FernIr.TypeReference): TypeReferenceNode => {
                if (typeRef.type === "named") {
                    const override = typeRefMap.get(typeRef.typeId);
                    if (override) {
                        return override;
                    }
                }
                return primitiveTypeRefNode("string");
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
            getReferenceToNamedType: (typeName: FernIr.DeclaredTypeName) => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode(typeName.name.pascalCase.unsafeName),
                getExpression: () => ts.factory.createIdentifier(typeName.name.pascalCase.unsafeName),
                getEntityName: () => ts.factory.createIdentifier(typeName.name.pascalCase.unsafeName)
            }),
            getTypeDeclaration: (typeName: FernIr.DeclaredTypeName): FernIr.TypeDeclaration => {
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
            getGeneratedType: (typeName: FernIr.DeclaredTypeName) => {
                const override = generatedTypeMap.get(typeName.typeId);
                if (override) {
                    return override;
                }
                return {
                    type: "object",
                    generateStatements: () => [],
                    generateForInlineUnion: () => ({
                        typeNode: ts.factory.createTypeReferenceNode(typeName.name.pascalCase.unsafeName),
                        requestTypeNode: undefined,
                        responseTypeNode: undefined
                    }),
                    getAllPropertiesIncludingExtensions: () => [],
                    getPropertyKey: ({ propertyWireKey }: { propertyWireKey: string }) => propertyWireKey,
                    generateProperties: () => [],
                    generateModule: () => undefined,
                    buildExample: () => ts.factory.createStringLiteral("example-value"),
                    buildExampleProperties: () => []
                };
            },
            getGeneratedTypeById: (typeId: string) => {
                const override = generatedTypeByIdMap.get(typeId);
                if (override) {
                    return override;
                }
                return {
                    type: "object",
                    buildExample: () => ts.factory.createStringLiteral("example-value"),
                    buildExampleProperties: () => []
                };
            },
            getGeneratedExample: (_example: FernIr.ExampleTypeReference) => ({
                build: () => ts.factory.createStringLiteral("example-value")
            }),
            needsRequestResponseTypeVariantByType: () => ({ request: false, response: false }),
            needsRequestResponseTypeVariantById: () => ({ request: false, response: false }),
            typeNameToTypeReference: (typeName: FernIr.DeclaredTypeName): FernIr.TypeReference => {
                return FernIr.TypeReference.named({
                    typeId: typeName.typeId,
                    fernFilepath: typeName.fernFilepath,
                    name: typeName.name,
                    displayName: typeName.displayName,
                    default: undefined,
                    inline: undefined
                });
            }
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates a GeneratedUnionTypeImpl with the given config.
 */
function createUnionGenerator(opts: {
    typeName: string;
    shape: FernIr.UnionTypeDeclaration;
    docs?: string;
    examples?: FernIr.ExampleType[];
    includeUtilsOnUnionMembers?: boolean;
    includeOtherInUnionTypes?: boolean;
    includeSerdeLayer?: boolean;
    retainOriginalCasing?: boolean;
    noOptionalProperties?: boolean;
    enableInlineTypes?: boolean;
    generateReadWriteOnlyTypes?: boolean;
    inline?: boolean;
    // biome-ignore lint/suspicious/noExplicitAny: test factory with generic type parameter
}): GeneratedUnionTypeImpl<any> {
    return new GeneratedUnionTypeImpl({
        typeName: opts.typeName,
        shape: opts.shape,
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
        includeUtilsOnUnionMembers: opts.includeUtilsOnUnionMembers ?? false,
        includeOtherInUnionTypes: opts.includeOtherInUnionTypes ?? false,
        inline: opts.inline ?? false
    });
}

/**
 * Serializes generateStatements output by writing to a ts-morph SourceFile.
 */
// biome-ignore lint/suspicious/noExplicitAny: test utility accepting mock context or generator
function serializeStatements(generator: any, context?: any): string {
    const ctx = context ?? createMockBaseContext();
    const statements = generator.generateStatements(ctx);
    ctx.sourceFile.addStatements(statements);
    return ctx.sourceFile.getFullText();
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests — GeneratedUnionTypeImpl
// ──────────────────────────────────────────────────────────────────────────────

describe("GeneratedUnionTypeImpl", () => {
    describe("generateStatements / writeToFile", () => {
        it("generates basic union with singleProperty members", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "value",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    }),
                    createSinglePropertyUnionType({
                        discriminantValue: "bar",
                        propertyName: "value",
                        propertyType: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined })
                    })
                ]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with samePropertiesAsObject members", () => {
            const circleType = createDeclaredTypeName("Circle");
            const squareType = createDeclaredTypeName("Square");

            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSamePropertiesAsObjectUnionType({
                        discriminantValue: "circle",
                        typeName: circleType
                    }),
                    createSamePropertiesAsObjectUnionType({
                        discriminantValue: "square",
                        typeName: squareType
                    })
                ]
            });

            const context = createMockBaseContext({
                typeRefOverrides: new Map([
                    [circleType.typeId, namedTypeRefNode("Circle")],
                    [squareType.typeId, namedTypeRefNode("Square")]
                ])
            });

            const generator = createUnionGenerator({ typeName: "Shape", shape });
            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates union with noProperties members", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "empty" })
                ]
            });

            const generator = createUnionGenerator({ typeName: "UnionWithNoProperties", shape });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with mixed member shapes", () => {
            const circleType = createDeclaredTypeName("Circle");

            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "value",
                        propertyName: "data",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    }),
                    createSamePropertiesAsObjectUnionType({
                        discriminantValue: "circle",
                        typeName: circleType
                    }),
                    createNoPropertiesUnionType({ discriminantValue: "empty" })
                ]
            });

            const context = createMockBaseContext({
                typeRefOverrides: new Map([[circleType.typeId, namedTypeRefNode("Circle")]])
            });

            const generator = createUnionGenerator({ typeName: "MixedUnion", shape });
            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates union with baseProperties", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ],
                baseProperties: [
                    {
                        name: createNameAndWireValueFromName("id"),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined,
                        availability: undefined,
                        v2Examples: undefined,
                        propertyAccess: undefined
                    }
                ]
            });

            const generator = createUnionGenerator({ typeName: "UnionWithBase", shape });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with extends", () => {
            const withNameType = createDeclaredTypeName("WithName");

            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ],
                baseProperties: [
                    {
                        name: createNameAndWireValueFromName("id"),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined,
                        availability: undefined,
                        v2Examples: undefined,
                        propertyAccess: undefined
                    }
                ],
                extends: [withNameType]
            });

            const context = createMockBaseContext({
                typeRefOverrides: new Map([[withNameType.typeId, namedTypeRefNode("WithName")]])
            });

            const generator = createUnionGenerator({ typeName: "Shape", shape });
            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates union with includeUtilsOnUnionMembers (builders + visitor)", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "value",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeUtilsOnUnionMembers: true
            });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with includeOtherInUnionTypes", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "value",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeUtilsOnUnionMembers: true,
                includeOtherInUnionTypes: true
            });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with docs on type", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                docs: "This is a simple union type."
            });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with docs on members", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo", docs: "The foo variant." }),
                    createNoPropertiesUnionType({ discriminantValue: "bar", docs: "The bar variant." })
                ]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with single member", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "name",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                ]
            });

            const generator = createUnionGenerator({ typeName: "UnionWithSingleElement", shape });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with retainOriginalCasing", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                discriminantWireValue: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "value",
                        propertyWireValue: "value",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                retainOriginalCasing: true
            });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union without serde layer", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                discriminantWireValue: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "value",
                        propertyWireValue: "value",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeSerdeLayer: false
            });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates union with examples in docs", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ]
            });

            const exampleShape = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("foo"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.noProperties()
                },
                baseProperties: undefined,
                extendProperties: undefined
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                docs: "A union type.",
                examples: [{ shape: exampleShape, docs: undefined, name: undefined, jsonExample: {} }]
            });
            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });
    });

    describe("generateForInlineUnion", () => {
        it("returns parenthesized union type node", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const context = createMockBaseContext();
            const result = generator.generateForInlineUnion(context);
            expect(getTextOfTsNode(result.typeNode)).toMatchSnapshot();
            expect(result.requestTypeNode).toBeUndefined();
            expect(result.responseTypeNode).toBeUndefined();
        });

        it("returns request/response type nodes when generateReadWriteOnlyTypes is true", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                generateReadWriteOnlyTypes: true
            });
            const context = createMockBaseContext();
            const result = generator.generateForInlineUnion(context);
            expect(getTextOfTsNode(result.typeNode)).toMatchSnapshot();
            assert(result.requestTypeNode != null, "requestTypeNode should be defined");
            expect(getTextOfTsNode(result.requestTypeNode)).toMatchSnapshot();
            assert(result.responseTypeNode != null, "responseTypeNode should be defined");
            expect(getTextOfTsNode(result.responseTypeNode)).toMatchSnapshot();
        });
    });

    describe("generateModule", () => {
        it("always returns undefined", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const result = generator.generateModule();
            expect(result).toBeUndefined();
        });
    });

    describe("getGeneratedUnion", () => {
        it("returns the wrapped GeneratedUnionImpl", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const union = generator.getGeneratedUnion();
            expect(union).toBeDefined();
            expect(union.discriminant).toBe("type");
        });
    });

    describe("getSinglePropertyKey", () => {
        it("returns camelCase name with serde layer", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "myValue",
                        propertyWireValue: "my_value"
                    })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeSerdeLayer: true,
                retainOriginalCasing: false
            });

            const singleProperty: FernIr.SingleUnionTypeProperty = {
                name: createNameAndWireValueFromName("myValue", "my_value"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };

            expect(generator.getSinglePropertyKey(singleProperty)).toBe("myValue");
        });

        it("returns wire value without serde layer", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "myValue",
                        propertyWireValue: "my_value"
                    })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeSerdeLayer: false
            });

            const singleProperty: FernIr.SingleUnionTypeProperty = {
                name: createNameAndWireValueFromName("myValue", "my_value"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };

            expect(generator.getSinglePropertyKey(singleProperty)).toBe("my_value");
        });

        it("returns wire value with serde layer and retainOriginalCasing", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "myValue",
                        propertyWireValue: "my_value"
                    })
                ]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeSerdeLayer: true,
                retainOriginalCasing: true
            });

            const singleProperty: FernIr.SingleUnionTypeProperty = {
                name: createNameAndWireValueFromName("myValue", "my_value"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            };

            expect(generator.getSinglePropertyKey(singleProperty)).toBe("my_value");
        });
    });

    describe("buildExample", () => {
        it("builds example with noProperties shape", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createNoPropertiesUnionType({ discriminantValue: "foo" }),
                    createNoPropertiesUnionType({ discriminantValue: "bar" })
                ]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const context = createMockBaseContext();

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("foo"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.noProperties()
                },
                baseProperties: undefined,
                extendProperties: undefined
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds example with singleProperty shape", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSinglePropertyUnionType({
                        discriminantValue: "foo",
                        propertyName: "value",
                        propertyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                ]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const context = createMockBaseContext();

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("foo"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.singleProperty({
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "hello" })
                        ),
                        jsonExample: "hello"
                    })
                },
                baseProperties: undefined,
                extendProperties: undefined
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds example with samePropertiesAsObject shape", () => {
            const circleType = createDeclaredTypeName("Circle");

            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [
                    createSamePropertiesAsObjectUnionType({
                        discriminantValue: "circle",
                        typeName: circleType
                    })
                ]
            });

            const context = createMockBaseContext({
                typeRefOverrides: new Map([[circleType.typeId, namedTypeRefNode("Circle")]]),
                generatedTypeByIdOverrides: new Map([
                    [
                        circleType.typeId,
                        {
                            type: "object",
                            buildExample: () => ts.factory.createStringLiteral("circle-example"),
                            buildExampleProperties: () => [
                                ts.factory.createPropertyAssignment("radius", ts.factory.createNumericLiteral(5))
                            ]
                        }
                    ]
                ])
            });

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("circle"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                        typeId: circleType.typeId,
                        object: { properties: [], extraProperties: undefined }
                    })
                },
                baseProperties: undefined,
                extendProperties: undefined
            });

            const generator = createUnionGenerator({ typeName: "Shape", shape });
            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds example with baseProperties", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })],
                baseProperties: [
                    {
                        name: createNameAndWireValueFromName("id"),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined,
                        availability: undefined,
                        v2Examples: undefined,
                        propertyAccess: undefined
                    }
                ]
            });

            const generator = createUnionGenerator({ typeName: "UnionWithBase", shape });
            const context = createMockBaseContext();

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("foo"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.noProperties()
                },
                baseProperties: [
                    {
                        name: createNameAndWireValueFromName("id"),
                        value: {
                            shape: FernIr.ExampleTypeReferenceShape.primitive(
                                FernIr.ExamplePrimitive.string({ original: "abc123" })
                            ),
                            jsonExample: "abc123"
                        }
                    }
                ],
                extendProperties: undefined
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds example with extendProperties", () => {
            const withNameType = createDeclaredTypeName("WithName");

            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })],
                extends: [withNameType]
            });

            const context = createMockBaseContext({
                typeRefOverrides: new Map([[withNameType.typeId, namedTypeRefNode("WithName")]])
            });

            const generator = createUnionGenerator({ typeName: "Shape", shape });

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("foo"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.noProperties()
                },
                baseProperties: undefined,
                extendProperties: [
                    {
                        name: createNameAndWireValueFromName("name"),
                        value: {
                            shape: FernIr.ExampleTypeReferenceShape.primitive(
                                FernIr.ExamplePrimitive.string({ original: "my-name" })
                            ),
                            jsonExample: "my-name"
                        },
                        propertyAccess: undefined,
                        originalTypeDeclaration: createDeclaredTypeName("WithName")
                    }
                ]
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds example with includeUtilsOnUnionMembers (calls builder)", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeUtilsOnUnionMembers: true
            });
            const context = createMockBaseContext();

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("foo"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.noProperties()
                },
                baseProperties: undefined,
                extendProperties: undefined
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("throws for non-union example shape", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const context = createMockBaseContext();

            const example = FernIr.ExampleTypeShape.object({
                properties: [],
                extraProperties: undefined
            });

            expect(() => generator.buildExample(example, context, { isForComment: true })).toThrow(
                "Example is not for an union"
            );
        });

        it("throws when singleProperty member not found in shape", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "bar" })]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const context = createMockBaseContext();

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("nonexistent"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.singleProperty({
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "test" })
                        ),
                        jsonExample: "test"
                    })
                },
                baseProperties: undefined,
                extendProperties: undefined
            });

            expect(() => generator.buildExample(example, context, { isForComment: true })).toThrow(
                "Cannot generate union example because union member is not singleProperty"
            );
        });

        it("throws when singleProperty example references a non-singleProperty member", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            const context = createMockBaseContext();

            const example = FernIr.ExampleTypeShape.union({
                discriminant: createNameAndWireValueFromName("type"),
                singleUnionType: {
                    wireDiscriminantValue: createNameAndWireValueFromName("foo"),
                    shape: FernIr.ExampleSingleUnionTypeProperties.singleProperty({
                        shape: FernIr.ExampleTypeReferenceShape.primitive(
                            FernIr.ExamplePrimitive.string({ original: "test" })
                        ),
                        jsonExample: "test"
                    })
                },
                baseProperties: undefined,
                extendProperties: undefined
            });

            expect(() => generator.buildExample(example, context, { isForComment: true })).toThrow(
                "Cannot generate union example because union member is not singleProperty"
            );
        });
    });

    describe("type property", () => {
        it("has type='union'", () => {
            const shape = createUnionDeclaration({
                discriminantName: "type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({ typeName: "MyUnion", shape });
            expect(generator.type).toBe("union");
        });
    });

    describe("discriminant handling", () => {
        it("uses camelCase discriminant name with serde layer", () => {
            const shape = createUnionDeclaration({
                discriminantName: "unionType",
                discriminantWireValue: "union_type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeSerdeLayer: true
            });
            const union = generator.getGeneratedUnion();
            expect(union.discriminant).toBe("unionType");
        });

        it("uses wire value discriminant without serde layer", () => {
            const shape = createUnionDeclaration({
                discriminantName: "unionType",
                discriminantWireValue: "union_type",
                types: [createNoPropertiesUnionType({ discriminantValue: "foo" })]
            });

            const generator = createUnionGenerator({
                typeName: "MyUnion",
                shape,
                includeSerdeLayer: false
            });
            const union = generator.getGeneratedUnion();
            expect(union.discriminant).toBe("union_type");
        });
    });
});
