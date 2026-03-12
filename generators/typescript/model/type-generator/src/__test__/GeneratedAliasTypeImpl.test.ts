import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, TypeReferenceNode } from "@fern-typescript/commons";
import { casingsGenerator, createDeclaredTypeName } from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { GeneratedAliasTypeImpl } from "../alias/GeneratedAliasTypeImpl.js";
import { GeneratedBrandedStringAliasImpl } from "../alias/GeneratedBrandedStringAliasImpl.js";

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
 * Builds a TypeReferenceNode with request/response variants.
 */
function readWriteTypeRefNode(opts: {
    baseType: string;
    requestType?: string;
    responseType?: string;
}): TypeReferenceNode {
    const baseNode = ts.factory.createTypeReferenceNode(opts.baseType);
    const reqNode = opts.requestType ? ts.factory.createTypeReferenceNode(opts.requestType) : undefined;
    const respNode = opts.responseType ? ts.factory.createTypeReferenceNode(opts.responseType) : undefined;
    return {
        isOptional: false,
        typeNode: baseNode,
        typeNodeWithoutUndefined: baseNode,
        requestTypeNode: reqNode,
        requestTypeNodeWithoutUndefined: reqNode,
        responseTypeNode: respNode,
        responseTypeNodeWithoutUndefined: respNode
    };
}

/**
 * Creates a mock BaseContext for alias type tests.
 * Provides: getReferenceToType, getReferenceToInlineAliasType, getTypeDeclaration,
 * getGeneratedType, getGeneratedExample.
 */
function createMockBaseContext(opts?: {
    typeRefOverrides?: Map<string, TypeReferenceNode>;
    typeDeclarationOverrides?: Map<string, FernIr.TypeDeclaration>;
    generatedTypeOverrides?: Map<string, unknown>;
}) {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");

    const typeRefMap = opts?.typeRefOverrides ?? new Map<string, TypeReferenceNode>();
    const typeDeclMap = opts?.typeDeclarationOverrides ?? new Map<string, FernIr.TypeDeclaration>();
    const generatedTypeMap = opts?.generatedTypeOverrides ?? new Map<string, unknown>();

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
            getReferenceToInlineAliasType: (
                typeRef: FernIr.TypeReference,
                _aliasTypeName: string
            ): TypeReferenceNode => {
                if (typeRef.type === "named") {
                    const override = typeRefMap.get(typeRef.typeId);
                    if (override) {
                        return override;
                    }
                }
                return primitiveTypeRefNode("string");
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
            getGeneratedExample: (_example: FernIr.ExampleTypeReference) => ({
                build: () => ts.factory.createStringLiteral("example-value")
            })
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

/**
 * Creates a GeneratedAliasTypeImpl with the given config.
 */
function createAliasGenerator(opts: {
    typeName: string;
    aliasOf: FernIr.TypeReference;
    docs?: string;
    examples?: FernIr.ExampleType[];
    enableInlineTypes?: boolean;
    // biome-ignore lint/suspicious/noExplicitAny: test factory with generic type parameter
}): GeneratedAliasTypeImpl<any> {
    return new GeneratedAliasTypeImpl({
        typeName: opts.typeName,
        shape: opts.aliasOf,
        examples: opts.examples ?? [],
        docs: opts.docs,
        fernFilepath: createFernFilepath(),
        getReferenceToSelf: () => ({
            getTypeNode: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getExpression: () => ts.factory.createIdentifier(opts.typeName),
            getEntityName: () => ts.factory.createIdentifier(opts.typeName)
        }),
        includeSerdeLayer: true,
        noOptionalProperties: false,
        retainOriginalCasing: false,
        enableInlineTypes: opts.enableInlineTypes ?? false,
        generateReadWriteOnlyTypes: false
    });
}

/**
 * Creates a GeneratedBrandedStringAliasImpl with the given config.
 */
function createBrandedGenerator(opts: {
    typeName: string;
    aliasOf?: FernIr.TypeReference;
    docs?: string;
    examples?: FernIr.ExampleType[];
    fernFilepath?: FernIr.FernFilepath;
    // biome-ignore lint/suspicious/noExplicitAny: test factory with generic type parameter
}): GeneratedBrandedStringAliasImpl<any> {
    const filepath = opts.fernFilepath ?? createFernFilepath();
    return new GeneratedBrandedStringAliasImpl({
        typeName: opts.typeName,
        shape: opts.aliasOf ?? FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        examples: opts.examples ?? [],
        docs: opts.docs,
        fernFilepath: filepath,
        getReferenceToSelf: () => ({
            getTypeNode: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getExpression: () => ts.factory.createIdentifier(opts.typeName),
            getEntityName: () => ts.factory.createIdentifier(opts.typeName)
        }),
        includeSerdeLayer: true,
        noOptionalProperties: false,
        retainOriginalCasing: false,
        enableInlineTypes: false,
        generateReadWriteOnlyTypes: false
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
// Tests — GeneratedAliasTypeImpl
// ──────────────────────────────────────────────────────────────────────────────

describe("GeneratedAliasTypeImpl", () => {
    describe("generateStatements / writeToFile", () => {
        it("generates type alias for primitive string", () => {
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates type alias for a named type reference", () => {
            const namedType = createDeclaredTypeName("OriginalType");
            const context = createMockBaseContext({
                typeRefOverrides: new Map([[namedType.typeId, primitiveTypeRefNode("string")]])
            });
            // Override getReferenceToInlineAliasType to return a named type reference
            context.type.getReferenceToInlineAliasType = (
                typeRef: FernIr.TypeReference,
                _aliasTypeName: string
            ): TypeReferenceNode => {
                if (typeRef.type === "named") {
                    const typeNode = ts.factory.createTypeReferenceNode("OriginalType");
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
                return primitiveTypeRefNode("string");
            };

            const generator = createAliasGenerator({
                typeName: "Object_",
                aliasOf: FernIr.TypeReference.named({
                    typeId: namedType.typeId,
                    fernFilepath: namedType.fernFilepath,
                    name: namedType.name,
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                })
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });

        it("generates type alias with docs", () => {
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                docs: "An alias for type IDs."
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates type alias with docs and @example annotation", () => {
            const exampleShape = FernIr.ExampleTypeShape.alias({
                value: {
                    shape: FernIr.ExampleTypeReferenceShape.primitive(
                        FernIr.ExamplePrimitive.string({ original: "type-kaljhv87" })
                    ),
                    jsonExample: "type-kaljhv87"
                }
            });
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                docs: "An alias for type IDs.",
                examples: [{ shape: exampleShape, docs: undefined, name: undefined, jsonExample: "type-kaljhv87" }]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });
    });

    describe("generateForInlineUnion", () => {
        it("returns type node from getReferenceToType", () => {
            const generator = createAliasGenerator({
                typeName: "StringAlias",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });

            const context = createMockBaseContext();
            const result = generator.generateForInlineUnion(context);
            expect(getTextOfTsNode(result.typeNode)).toBe("string");
            expect(result.requestTypeNode).toBeUndefined();
            expect(result.responseTypeNode).toBeUndefined();
        });

        it("returns request/response type nodes when present", () => {
            const namedType = createDeclaredTypeName("SharedType");
            const context = createMockBaseContext({
                typeRefOverrides: new Map([
                    [
                        namedType.typeId,
                        readWriteTypeRefNode({
                            baseType: "SharedType",
                            requestType: "RequestSharedType",
                            responseType: "ResponseSharedType"
                        })
                    ]
                ])
            });

            const generator = createAliasGenerator({
                typeName: "MyAlias",
                aliasOf: FernIr.TypeReference.named({
                    typeId: namedType.typeId,
                    fernFilepath: namedType.fernFilepath,
                    name: namedType.name,
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                })
            });

            const result = generator.generateForInlineUnion(context);
            expect(getTextOfTsNode(result.typeNode)).toBe("SharedType");
            assert(result.requestTypeNode != null, "requestTypeNode should be defined");
            expect(getTextOfTsNode(result.requestTypeNode)).toBe("RequestSharedType");
            assert(result.responseTypeNode != null, "responseTypeNode should be defined");
            expect(getTextOfTsNode(result.responseTypeNode)).toBe("ResponseSharedType");
        });
    });

    describe("generateModule", () => {
        it("returns undefined when enableInlineTypes is false", () => {
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                enableInlineTypes: false
            });

            const context = createMockBaseContext();
            const module = generator.generateModule(context);
            expect(module).toBeUndefined();
        });

        it("returns undefined when enableInlineTypes is true but alias is primitive", () => {
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                enableInlineTypes: true
            });

            const context = createMockBaseContext();
            const module = generator.generateModule(context);
            // generateInlineAliasModule returns undefined for primitive types (not named/list/set/map)
            expect(module).toBeUndefined();
        });

        it("returns undefined when enableInlineTypes is true and alias is named but not inline", () => {
            const namedType = createDeclaredTypeName("SomeType");
            const generator = createAliasGenerator({
                typeName: "MyAlias",
                aliasOf: FernIr.TypeReference.named({
                    typeId: namedType.typeId,
                    fernFilepath: namedType.fernFilepath,
                    name: namedType.name,
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                }),
                enableInlineTypes: true
            });

            // Default mock returns TypeDeclaration with inline: undefined → not inline
            const context = createMockBaseContext();
            const module = generator.generateModule(context);
            // generateInlineAliasModule returns undefined for named types (it goes to visitor.named which returns undefined)
            expect(module).toBeUndefined();
        });

        it("generates namespace module when alias is list with inline item type", () => {
            const inlineType = createDeclaredTypeName("InlineItem");
            const inlineTypeDecl: FernIr.TypeDeclaration = {
                name: inlineType,
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
            };

            const context = createMockBaseContext({
                typeDeclarationOverrides: new Map([[inlineType.typeId, inlineTypeDecl]]),
                generatedTypeOverrides: new Map([
                    [
                        inlineType.typeId,
                        {
                            type: "object",
                            generateStatements: () => ["export interface Item { value: string; }"],
                            getAllPropertiesIncludingExtensions: () => [],
                            getPropertyKey: ({ propertyWireKey }: { propertyWireKey: string }) => propertyWireKey
                        }
                    ]
                ])
            });

            const generator = createAliasGenerator({
                typeName: "ItemList",
                aliasOf: FernIr.TypeReference.container(
                    FernIr.ContainerType.list(
                        FernIr.TypeReference.named({
                            typeId: inlineType.typeId,
                            fernFilepath: inlineType.fernFilepath,
                            name: inlineType.name,
                            displayName: undefined,
                            default: undefined,
                            inline: undefined
                        })
                    )
                ),
                enableInlineTypes: true
            });

            const module = generator.generateModule(context);
            // Shallow assertion: verifies GeneratedAliasTypeImpl.generateModule()
            // delegates to generateInlineAliasModule when conditions are met.
            // The 247-line helper itself is out of scope for this unit test.
            assert(module != null, "module should be defined");
            expect(module.name).toBe("ItemList");
            expect(module.isExported).toBe(true);
        });
    });

    describe("buildExample", () => {
        it("builds example by delegating to getGeneratedExample", () => {
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });

            const context = createMockBaseContext();
            const example = FernIr.ExampleTypeShape.alias({
                value: {
                    shape: FernIr.ExampleTypeReferenceShape.primitive(
                        FernIr.ExamplePrimitive.string({ original: "type-abc123" })
                    ),
                    jsonExample: "type-abc123"
                }
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            // Note: mock getGeneratedExample returns hardcoded "example-value" regardless
            // of input. This test verifies wiring (buildExample delegates to
            // getGeneratedExample(example.value).build()), not example data flow.
            expect(getTextOfTsNode(result)).toBe('"example-value"');
        });

        it("throws for non-alias example shape", () => {
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });

            const context = createMockBaseContext();
            const example = FernIr.ExampleTypeShape.object({
                properties: [],
                extraProperties: undefined
            });

            expect(() => generator.buildExample(example, context, { isForComment: true })).toThrow(
                "Example is not for an alias"
            );
        });
    });

    describe("type properties", () => {
        it("has type='alias' and isBranded=false", () => {
            const generator = createAliasGenerator({
                typeName: "TypeId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });

            expect(generator.type).toBe("alias");
            expect(generator.isBranded).toBe(false);
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// Tests — GeneratedBrandedStringAliasImpl
// ──────────────────────────────────────────────────────────────────────────────

describe("GeneratedBrandedStringAliasImpl", () => {
    describe("generateStatements / writeToFile", () => {
        it("generates branded type alias and builder function", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId"
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates branded type with docs", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId",
                docs: "A unique user identifier."
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates branded type with multi-segment package path brand", () => {
            const generator = createBrandedGenerator({
                typeName: "ResourceId",
                fernFilepath: {
                    allParts: [casingsGenerator.generateName("api"), casingsGenerator.generateName("resources")],
                    packagePath: [casingsGenerator.generateName("api"), casingsGenerator.generateName("resources")],
                    file: casingsGenerator.generateName("resources")
                }
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("generates branded type with docs and @example annotation", () => {
            const exampleShape = FernIr.ExampleTypeShape.alias({
                value: {
                    shape: FernIr.ExampleTypeReferenceShape.primitive(
                        FernIr.ExamplePrimitive.string({ original: "user-abc123" })
                    ),
                    jsonExample: "user-abc123"
                }
            });
            const generator = createBrandedGenerator({
                typeName: "UserId",
                docs: "A unique user identifier.",
                examples: [{ shape: exampleShape, docs: undefined, name: undefined, jsonExample: "user-abc123" }]
            });

            const output = serializeStatements(generator);
            expect(output).toMatchSnapshot();
        });

        it("uses the aliased type for the branded intersection", () => {
            // Alias of a number type — the intersection base type comes from
            // getReferenceToType (returns number here), but the builder function
            // parameter is always hardcoded to `string` (line 98 of source).
            // This is intentional: the class is GeneratedBranded*String*AliasImpl.
            const context = createMockBaseContext();
            context.type.getReferenceToType = (): TypeReferenceNode => primitiveTypeRefNode("number");

            const generator = createBrandedGenerator({
                typeName: "NumericId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined })
            });

            const output = serializeStatements(generator, context);
            expect(output).toMatchSnapshot();
        });
    });

    describe("generateForInlineUnion", () => {
        it("returns the branded type alias as the type node", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId"
            });

            const context = createMockBaseContext();
            const result = generator.generateForInlineUnion(context);
            // The branded type uses writerToString on the type alias structure,
            // which produces the intersection type text
            expect(result.typeNode).toBeDefined();
            expect(result.requestTypeNode).toBeUndefined();
            expect(result.responseTypeNode).toBeUndefined();
        });
    });

    describe("generateModule", () => {
        it("always returns undefined", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId"
            });

            const module = generator.generateModule();
            expect(module).toBeUndefined();
        });
    });

    describe("getReferenceToCreator", () => {
        it("returns expression referencing the type name", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId"
            });

            const context = createMockBaseContext();
            const expr = generator.getReferenceToCreator(context);
            expect(getTextOfTsNode(expr)).toBe("UserId");
        });
    });

    describe("buildExample", () => {
        it("wraps example value in a call to the creator function", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId"
            });

            const context = createMockBaseContext();
            const example = FernIr.ExampleTypeShape.alias({
                value: {
                    shape: FernIr.ExampleTypeReferenceShape.primitive(
                        FernIr.ExamplePrimitive.string({ original: "user-abc123" })
                    ),
                    jsonExample: "user-abc123"
                }
            });

            const result = generator.buildExample(example, context, { isForComment: true });
            // Should produce: UserId("example-value")
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("throws for non-alias example shape", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId"
            });

            const context = createMockBaseContext();
            const example = FernIr.ExampleTypeShape.object({
                properties: [],
                extraProperties: undefined
            });

            expect(() => generator.buildExample(example, context, { isForComment: true })).toThrow(
                "Example is not for an alias"
            );
        });
    });

    describe("type properties", () => {
        it("has type='alias' and isBranded=true", () => {
            const generator = createBrandedGenerator({
                typeName: "UserId"
            });

            expect(generator.type).toBe("alias");
            expect(generator.isBranded).toBe(true);
        });
    });
});
