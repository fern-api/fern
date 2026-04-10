import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { Zurg } from "@fern-typescript/commons";
import { GeneratedType } from "@fern-typescript/contexts";
import {
    caseConverter,
    casingsGenerator,
    createMockReference,
    createNameAndWireValue
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedAliasTypeSchemaImpl } from "../alias/GeneratedAliasTypeSchemaImpl.js";
import { GeneratedEnumTypeSchemaImpl } from "../enum/GeneratedEnumTypeSchemaImpl.js";
import { GeneratedObjectTypeSchemaImpl } from "../object/GeneratedObjectTypeSchemaImpl.js";
import { TypeSchemaGenerator } from "../TypeSchemaGenerator.js";
import { GeneratedUndiscriminatedUnionTypeSchemaImpl } from "../undiscriminated-union/GeneratedUndiscriminatedUnionTypeSchemaImpl.js";
import { GeneratedUnionTypeSchemaImpl } from "../union/GeneratedUnionTypeSchemaImpl.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Creates a minimal Zurg.Schema mock that returns an expression for serialization.
 */
function createMockZurgSchema(exprText: string): Zurg.Schema {
    const base: Zurg.BaseSchema = {
        isOptional: false,
        isNullable: false,
        toExpression: () => ts.factory.createIdentifier(exprText)
    };
    return {
        ...base,
        parse: (raw: ts.Expression) => raw,
        json: (parsed: ts.Expression) => parsed,
        parseOrThrow: (raw: ts.Expression) => raw,
        jsonOrThrow: (parsed: ts.Expression) => parsed,
        nullable: () => createMockZurgSchema(`${exprText}.nullable()`),
        optional: () => createMockZurgSchema(`${exprText}.optional()`),
        optionalNullable: () => createMockZurgSchema(`${exprText}.optionalNullable()`),
        transform: () => createMockZurgSchema(`${exprText}.transform()`)
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal Zurg.Schema interface
    } as any;
}

/**
 * Creates a mock Zurg.ObjectSchema with extend and passthrough support.
 */
function createMockZurgObjectSchema(exprText: string): Zurg.ObjectSchema {
    const base: Zurg.BaseSchema = {
        isOptional: false,
        isNullable: false,
        toExpression: () => ts.factory.createIdentifier(exprText)
    };
    return {
        ...base,
        parse: (raw: ts.Expression) => raw,
        json: (parsed: ts.Expression) => parsed,
        parseOrThrow: (raw: ts.Expression) => raw,
        jsonOrThrow: (parsed: ts.Expression) => parsed,
        nullable: () => createMockZurgSchema(`${exprText}.nullable()`),
        optional: () => createMockZurgSchema(`${exprText}.optional()`),
        optionalNullable: () => createMockZurgSchema(`${exprText}.optionalNullable()`),
        transform: () => createMockZurgSchema(`${exprText}.transform()`),
        withParsedProperties: () => createMockZurgObjectSchema(`${exprText}.withParsedProperties()`),
        extend: (ext: Zurg.Schema) => createMockZurgObjectSchema(`${exprText}.extend()`),
        passthrough: () => createMockZurgObjectSchema(`${exprText}.passthrough()`)
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal Zurg.ObjectSchema interface
    } as any;
}

/**
 * Creates a mock ModelContext for type schema generation tests.
 * Schema generators access:
 * - context.sourceFile (for writeSchemaToFile)
 * - context.coreUtilities.zurg.* (for building schema expressions)
 * - context.typeSchema.getSchemaOfTypeReference (for property/member schemas)
 * - context.typeSchema.getSchemaOfNamedType (for extends)
 * - context.typeSchema.getReferenceToRawType (for raw type declarations)
 * - context.typeSchema.getReferenceToRawNamedType (for raw extends)
 */
function createMockContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        coreUtilities: {
            zurg: {
                object: (props: Zurg.Property[]) => createMockZurgObjectSchema("object({})"),
                objectWithoutOptionalProperties: (props: Zurg.Property[]) =>
                    createMockZurgObjectSchema("objectWithoutOptionalProperties({})"),
                enum: (values: string[]) => createMockZurgSchema(`enum_([${values.map((v) => `"${v}"`).join(", ")}])`),
                undiscriminatedUnion: (schemas: Zurg.Schema[]) => createMockZurgSchema("undiscriminatedUnion([...])"),
                union: (args: Zurg.union.Args) => createMockZurgObjectSchema("union({})"),
                Schema: {
                    _getReferenceToType: ({
                        rawShape,
                        parsedShape
                    }: {
                        rawShape: ts.TypeNode;
                        parsedShape: ts.TypeNode;
                    }) =>
                        ts.factory.createTypeReferenceNode("Schema", [
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createQualifiedName(ts.factory.createIdentifier("serializers"), "Raw")
                            ),
                            parsedShape
                        ]),
                    _fromExpression: (expr: ts.Expression) => createMockZurgSchema("fromExpression")
                },
                ObjectSchema: {
                    _getReferenceToType: ({
                        rawShape,
                        parsedShape
                    }: {
                        rawShape: ts.TypeNode;
                        parsedShape: ts.TypeNode;
                    }) =>
                        ts.factory.createTypeReferenceNode("ObjectSchema", [
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createQualifiedName(ts.factory.createIdentifier("serializers"), "Raw")
                            ),
                            parsedShape
                        ])
                }
            }
        },
        typeSchema: {
            getSchemaOfTypeReference: (_typeRef: FernIr.TypeReference) => createMockZurgSchema("stringSchema()"),
            getSchemaOfNamedType: (_typeName: FernIr.DeclaredTypeName, _opts: { isGeneratingSchema: boolean }) =>
                createMockZurgSchema("namedTypeSchema()"),
            getReferenceToRawType: (_typeRef: FernIr.TypeReference) => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                isOptional: false
            }),
            getReferenceToRawNamedType: (_typeName: FernIr.DeclaredTypeName) => createMockReference("RawNamedType")
        },
        type: {
            getReferenceToType: (_typeRef: FernIr.TypeReference) => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            })
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal ModelContext interface
    } as any;
}

/**
 * Creates a mock GeneratedType for enum schemas.
 */
function createMockGeneratedEnumType(): GeneratedType<unknown> {
    return {
        type: "enum"
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal GeneratedType interface
    } as any;
}

/**
 * Creates a mock GeneratedType for object schemas.
 */
function createMockGeneratedObjectType(opts?: { propertyKeys?: Record<string, string> }): GeneratedType<unknown> {
    return {
        type: "object",
        getPropertyKey: ({ propertyWireKey }: { propertyWireKey: string }) =>
            opts?.propertyKeys?.[propertyWireKey] ?? propertyWireKey
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal GeneratedType interface
    } as any;
}

/**
 * Creates a mock GeneratedType for alias schemas.
 */
function createMockGeneratedAliasType(opts?: { isBranded?: boolean }): GeneratedType<unknown> {
    return {
        type: "alias",
        isBranded: opts?.isBranded ?? false,
        getReferenceToCreator: () => ts.factory.createIdentifier("BrandedType")
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal GeneratedType interface
    } as any;
}

/**
 * Creates a mock GeneratedType for union schemas.
 */
function createMockGeneratedUnionType(): GeneratedType<unknown> {
    return {
        type: "union",
        getGeneratedUnion: () => ({
            discriminant: "type",
            visitPropertyName: "_visit",
            getReferenceTo: () => ts.factory.createTypeReferenceNode("ParsedUnion"),
            buildUnknown: ({ existingValue }: { existingValue: ts.Expression }) => existingValue,
            buildFromExistingValue: ({ existingValue }: { existingValue: ts.Expression }) => existingValue,
            getBasePropertyKey: (wireValue: string) => wireValue
        }),
        getSinglePropertyKey: ({ name }: { name: FernIr.NameAndWireValue }) => name.wireValue
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal GeneratedType interface
    } as any;
}

/**
 * Creates a mock GeneratedType for undiscriminated union schemas.
 */
function createMockGeneratedUndiscriminatedUnionType(): GeneratedType<unknown> {
    return {
        type: "undiscriminatedUnion"
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal GeneratedType interface
    } as any;
}

/**
 * Creates an EnumValue IR object.
 */
function createEnumValue(name: string, wireValue?: string): FernIr.EnumValue {
    return {
        name: createNameAndWireValue(name, wireValue ?? name.toLowerCase()),
        docs: undefined,
        availability: undefined
    };
}

/**
 * Creates an ObjectProperty IR object.
 */
function createObjectProperty(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { wireValue?: string }
): FernIr.ObjectProperty {
    return {
        name: createNameAndWireValue(name, opts?.wireValue ?? name),
        valueType,
        docs: undefined,
        availability: undefined,
        v2Examples: undefined,
        propertyAccess: undefined
    };
}

/**
 * Creates a DeclaredTypeName for test use.
 */
function createDeclaredTypeName(name: string): FernIr.DeclaredTypeName {
    return {
        typeId: `type_${name}`,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: casingsGenerator.generateName(name),
        displayName: undefined
    };
}

/**
 * Helper to write a schema to file and get the output text.
 */
function writeSchemaAndGetText(
    // biome-ignore lint/suspicious/noExplicitAny: test helper accepts any schema with writeToFile
    schema: { writeToFile: (context: any) => void },
    context?: ReturnType<typeof createMockContext>
): string {
    const ctx = context ?? createMockContext();
    schema.writeToFile(ctx);
    return ctx.sourceFile.getFullText();
}

// ────────────────────────────────────────────────────────────────────────────
// TypeSchemaGenerator (factory/dispatcher)
// ────────────────────────────────────────────────────────────────────────────

describe("TypeSchemaGenerator", () => {
    it("dispatches enum shape to GeneratedEnumTypeSchemaImpl", () => {
        const generator = new TypeSchemaGenerator({
            includeUtilsOnUnionMembers: false,
            noOptionalProperties: false,
            caseConverter
        });

        const shape = FernIr.Type.enum({
            values: [createEnumValue("Active")],
            default: undefined,
            forwardCompatible: undefined
        });
        const schema = generator.generateTypeSchema({
            typeName: "Status",
            shape,
            getGeneratedType: createMockGeneratedEnumType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode("Status"),
            getReferenceToGeneratedTypeSchema: () => createMockReference("StatusSchema")
        });

        expect(schema.type).toBe("enum");
    });

    it("dispatches object shape to GeneratedObjectTypeSchemaImpl", () => {
        const generator = new TypeSchemaGenerator({
            includeUtilsOnUnionMembers: false,
            noOptionalProperties: false,
            caseConverter
        });

        const shape = FernIr.Type.object({
            properties: [],
            extends: [],
            extraProperties: false,
            extendedProperties: undefined
        });
        const schema = generator.generateTypeSchema({
            typeName: "User",
            shape,
            getGeneratedType: createMockGeneratedObjectType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode("User"),
            getReferenceToGeneratedTypeSchema: () => createMockReference("UserSchema")
        });

        expect(schema.type).toBe("object");
    });

    it("dispatches alias shape to GeneratedAliasTypeSchemaImpl", () => {
        const generator = new TypeSchemaGenerator({
            includeUtilsOnUnionMembers: false,
            noOptionalProperties: false,
            caseConverter
        });

        const shape = FernIr.Type.alias({
            aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
            resolvedType: FernIr.ResolvedTypeReference.primitive({
                v1: FernIr.PrimitiveTypeV1.String,
                v2: undefined
            })
        });
        const schema = generator.generateTypeSchema({
            typeName: "UserId",
            shape,
            getGeneratedType: createMockGeneratedAliasType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode("UserId"),
            getReferenceToGeneratedTypeSchema: () => createMockReference("UserIdSchema")
        });

        expect(schema.type).toBe("alias");
    });

    it("dispatches union shape to GeneratedUnionTypeSchemaImpl", () => {
        const generator = new TypeSchemaGenerator({
            includeUtilsOnUnionMembers: false,
            noOptionalProperties: false,
            caseConverter
        });

        const shape = FernIr.Type.union({
            discriminant: createNameAndWireValue("type", "type"),
            extends: [],
            types: [],
            baseProperties: [],
            discriminatorContext: undefined
        });
        const schema = generator.generateTypeSchema({
            typeName: "Shape",
            shape,
            getGeneratedType: createMockGeneratedUnionType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode("Shape"),
            getReferenceToGeneratedTypeSchema: () => createMockReference("ShapeSchema")
        });

        expect(schema.type).toBe("union");
    });

    it("dispatches undiscriminated union shape", () => {
        const generator = new TypeSchemaGenerator({
            includeUtilsOnUnionMembers: false,
            noOptionalProperties: false,
            caseConverter
        });

        const shape = FernIr.Type.undiscriminatedUnion({
            members: []
        });
        const schema = generator.generateTypeSchema({
            typeName: "Value",
            shape,
            getGeneratedType: createMockGeneratedUndiscriminatedUnionType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode("Value"),
            getReferenceToGeneratedTypeSchema: () => createMockReference("ValueSchema")
        });

        expect(schema.type).toBe("undiscriminatedUnion");
    });

    it("passes noOptionalProperties to generated schemas", () => {
        const generator = new TypeSchemaGenerator({
            includeUtilsOnUnionMembers: false,
            noOptionalProperties: true,
            caseConverter
        });

        const shape = FernIr.Type.object({
            properties: [createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))],
            extends: [],
            extraProperties: false,
            extendedProperties: undefined
        });
        const schema = generator.generateTypeSchema({
            typeName: "User",
            shape,
            getGeneratedType: createMockGeneratedObjectType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode("User"),
            getReferenceToGeneratedTypeSchema: () => createMockReference("UserSchema")
        });

        // When noOptionalProperties is true, the schema uses objectWithoutOptionalProperties
        const context = createMockContext();
        schema.writeToFile(context);
        const output = context.sourceFile.getFullText();
        expect(output).toMatchSnapshot();
    });

    it("passes includeUtilsOnUnionMembers to union schemas", () => {
        const generator = new TypeSchemaGenerator({
            includeUtilsOnUnionMembers: true,
            noOptionalProperties: false,
            caseConverter
        });

        const shape = FernIr.Type.union({
            discriminant: createNameAndWireValue("type", "type"),
            extends: [],
            types: [],
            baseProperties: [],
            discriminatorContext: undefined
        });
        const schema = generator.generateTypeSchema({
            typeName: "Shape",
            shape,
            getGeneratedType: createMockGeneratedUnionType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode("Shape"),
            getReferenceToGeneratedTypeSchema: () => createMockReference("ShapeSchema")
        });

        // Schema is created without errors — includeUtilsOnUnionMembers is passed to the union schema
        expect(schema.type).toBe("union");
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedEnumTypeSchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedEnumTypeSchemaImpl", () => {
    function createEnumSchema(opts: { typeName: string; values: FernIr.EnumValue[]; noOptionalProperties?: boolean }) {
        return new GeneratedEnumTypeSchemaImpl({
            typeName: opts.typeName,
            shape: { values: opts.values, default: undefined, forwardCompatible: undefined },
            getGeneratedType: createMockGeneratedEnumType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getReferenceToGeneratedTypeSchema: () => createMockReference(`${opts.typeName}Schema`),
            noOptionalProperties: opts.noOptionalProperties ?? false,
            caseConverter
        });
    }

    describe("writeToFile", () => {
        it("generates schema for basic enum", () => {
            const schema = createEnumSchema({
                typeName: "Status",
                values: [
                    createEnumValue("Active", "active"),
                    createEnumValue("Inactive", "inactive"),
                    createEnumValue("Pending", "pending")
                ]
            });

            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for single-value enum", () => {
            const schema = createEnumSchema({
                typeName: "Direction",
                values: [createEnumValue("North", "north")]
            });

            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates raw type declaration with wire values as string literals", () => {
            const schema = createEnumSchema({
                typeName: "Color",
                values: [
                    createEnumValue("Red", "RED"),
                    createEnumValue("Blue", "BLUE"),
                    createEnumValue("Green", "GREEN")
                ]
            });

            const output = writeSchemaAndGetText(schema);
            // Raw type should contain string literal union of wire values
            expect(output).toContain("RED");
            expect(output).toContain("BLUE");
            expect(output).toContain("GREEN");
            expect(output).toMatchSnapshot();
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedObjectTypeSchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedObjectTypeSchemaImpl", () => {
    function createObjectSchema(opts: {
        typeName: string;
        properties?: FernIr.ObjectProperty[];
        extends?: FernIr.DeclaredTypeName[];
        extraProperties?: boolean;
        noOptionalProperties?: boolean;
    }) {
        return new GeneratedObjectTypeSchemaImpl({
            typeName: opts.typeName,
            shape: {
                properties: opts.properties ?? [],
                extends: opts.extends ?? [],
                extraProperties: opts.extraProperties ?? false,
                extendedProperties: undefined
            },
            getGeneratedType: () =>
                createMockGeneratedObjectType({
                    propertyKeys: Object.fromEntries(
                        (opts.properties ?? []).map((p) => [getWireValue(p.name), caseConverter.camelUnsafe(p.name)])
                    )
                }),
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getReferenceToGeneratedTypeSchema: () => createMockReference(`${opts.typeName}Schema`),
            noOptionalProperties: opts.noOptionalProperties ?? false,
            caseConverter
        });
    }

    describe("writeToFile", () => {
        it("generates schema for object with no properties", () => {
            const schema = createObjectSchema({ typeName: "Empty" });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for object with properties", () => {
            const schema = createObjectSchema({
                typeName: "User",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty("age", FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }))
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for object with extends", () => {
            const schema = createObjectSchema({
                typeName: "Admin",
                properties: [
                    createObjectProperty("role", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                extends: [createDeclaredTypeName("User")]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for object with extraProperties (passthrough)", () => {
            const schema = createObjectSchema({
                typeName: "Config",
                properties: [
                    createObjectProperty("key", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                extraProperties: true
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for object with extends and extraProperties", () => {
            const schema = createObjectSchema({
                typeName: "ExtendedConfig",
                extends: [createDeclaredTypeName("BaseConfig")],
                properties: [
                    createObjectProperty("value", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                extraProperties: true
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("uses objectWithoutOptionalProperties when noOptionalProperties is true", () => {
            const schema = createObjectSchema({
                typeName: "StrictUser",
                properties: [
                    createObjectProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ],
                noOptionalProperties: true
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates raw type with optional properties (hasQuestionToken)", () => {
            const context = createMockContext();
            // Override getReferenceToRawType to return optional for some properties
            let callCount = 0;
            context.typeSchema.getReferenceToRawType = () => {
                callCount++;
                return {
                    typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    isOptional: callCount % 2 === 0 // second property is optional
                };
            };

            const schema = createObjectSchema({
                typeName: "Partial",
                properties: [
                    createObjectProperty("required", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createObjectProperty("optional", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });
            schema.writeToFile(context);
            const output = context.sourceFile.getFullText();
            expect(output).toMatchSnapshot();
        });

        it("generates raw type with index signature for extraProperties", () => {
            const schema = createObjectSchema({
                typeName: "Dynamic",
                properties: [],
                extraProperties: true
            });
            const output = writeSchemaAndGetText(schema);
            // Should contain [key: string]: any for extra properties
            expect(output).toMatchSnapshot();
        });

        it("generates raw type with extends references", () => {
            const schema = createObjectSchema({
                typeName: "Child",
                extends: [createDeclaredTypeName("Parent"), createDeclaredTypeName("Mixin")]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });
    });

    it("returns ObjectSchema type reference for getReferenceToSchemaType", () => {
        const schema = createObjectSchema({ typeName: "User" });
        const context = createMockContext();
        schema.writeToFile(context);
        const output = context.sourceFile.getFullText();
        // The schema type should use ObjectSchema, not plain Schema
        expect(output).toContain("ObjectSchema");
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedAliasTypeSchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedAliasTypeSchemaImpl", () => {
    function createAliasSchema(opts: {
        typeName: string;
        aliasOf: FernIr.TypeReference;
        resolvedType: FernIr.ResolvedTypeReference;
        isBranded?: boolean;
        noOptionalProperties?: boolean;
    }) {
        return new GeneratedAliasTypeSchemaImpl({
            typeName: opts.typeName,
            shape: {
                aliasOf: opts.aliasOf,
                resolvedType: opts.resolvedType
            },
            getGeneratedType: () => createMockGeneratedAliasType({ isBranded: opts.isBranded }),
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getReferenceToGeneratedTypeSchema: () => createMockReference(`${opts.typeName}Schema`),
            noOptionalProperties: opts.noOptionalProperties ?? false,
            caseConverter
        });
    }

    describe("writeToFile", () => {
        it("generates schema for simple string alias", () => {
            const schema = createAliasSchema({
                typeName: "UserId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                resolvedType: FernIr.ResolvedTypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.String,
                    v2: undefined
                })
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for branded alias with transform", () => {
            const schema = createAliasSchema({
                typeName: "BrandedId",
                aliasOf: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                resolvedType: FernIr.ResolvedTypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.String,
                    v2: undefined
                }),
                isBranded: true
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for alias of named object type", () => {
            const schema = createAliasSchema({
                typeName: "UserAlias",
                aliasOf: FernIr.TypeReference.named({
                    typeId: "type_User",
                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                    name: casingsGenerator.generateName("User"),
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                }),
                resolvedType: FernIr.ResolvedTypeReference.named({
                    name: createDeclaredTypeName("User"),
                    shape: FernIr.ShapeType.Object
                })
            });
            const output = writeSchemaAndGetText(schema);
            // For named object aliases, should use ObjectSchema type reference
            expect(output).toContain("ObjectSchema");
            expect(output).toMatchSnapshot();
        });

        it("generates schema for alias of non-object named type (uses Schema)", () => {
            const schema = createAliasSchema({
                typeName: "StatusAlias",
                aliasOf: FernIr.TypeReference.named({
                    typeId: "type_Status",
                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                    name: casingsGenerator.generateName("Status"),
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                }),
                resolvedType: FernIr.ResolvedTypeReference.named({
                    name: createDeclaredTypeName("Status"),
                    shape: FernIr.ShapeType.Enum
                })
            });
            const output = writeSchemaAndGetText(schema);
            // For non-object named aliases, should use Schema type reference (not ObjectSchema)
            expect(output).not.toContain("ObjectSchema");
            expect(output).toMatchSnapshot();
        });

        it("generates raw type alias pointing to raw type reference", () => {
            const schema = createAliasSchema({
                typeName: "MyAlias",
                aliasOf: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                resolvedType: FernIr.ResolvedTypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.Integer,
                    v2: undefined
                })
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedUndiscriminatedUnionTypeSchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedUndiscriminatedUnionTypeSchemaImpl", () => {
    function createUndiscriminatedUnionSchema(opts: {
        typeName: string;
        members: FernIr.UndiscriminatedUnionMember[];
        noOptionalProperties?: boolean;
    }) {
        return new GeneratedUndiscriminatedUnionTypeSchemaImpl({
            typeName: opts.typeName,
            shape: { members: opts.members },
            getGeneratedType: createMockGeneratedUndiscriminatedUnionType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getReferenceToGeneratedTypeSchema: () => createMockReference(`${opts.typeName}Schema`),
            noOptionalProperties: opts.noOptionalProperties ?? false,
            caseConverter
        });
    }

    function createUndiscriminatedMember(
        type: FernIr.TypeReference,
        opts?: { docs?: string }
    ): FernIr.UndiscriminatedUnionMember {
        return {
            type,
            docs: opts?.docs
        };
    }

    describe("writeToFile", () => {
        it("generates schema for union with primitive members", () => {
            const schema = createUndiscriminatedUnionSchema({
                typeName: "Value",
                members: [
                    createUndiscriminatedMember(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createUndiscriminatedMember(FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }))
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for single-member union", () => {
            const schema = createUndiscriminatedUnionSchema({
                typeName: "SingleValue",
                members: [createUndiscriminatedMember(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema for union with named type members", () => {
            const schema = createUndiscriminatedUnionSchema({
                typeName: "Response",
                members: [
                    createUndiscriminatedMember(
                        FernIr.TypeReference.named({
                            typeId: "type_Success",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("Success"),
                            displayName: undefined,
                            default: undefined,
                            inline: undefined
                        })
                    ),
                    createUndiscriminatedMember(
                        FernIr.TypeReference.named({
                            typeId: "type_Error",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("Error"),
                            displayName: undefined,
                            default: undefined,
                            inline: undefined
                        })
                    )
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates raw type alias as union of raw member types", () => {
            const schema = createUndiscriminatedUnionSchema({
                typeName: "MixedValue",
                members: [
                    createUndiscriminatedMember(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })),
                    createUndiscriminatedMember(FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined })),
                    createUndiscriminatedMember(FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }))
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedUnionTypeSchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedUnionTypeSchemaImpl", () => {
    function createUnionSchema(opts: {
        typeName: string;
        discriminant: FernIr.NameAndWireValue;
        types?: FernIr.SingleUnionType[];
        baseProperties?: FernIr.ObjectProperty[];
        includeUtilsOnUnionMembers?: boolean;
        noOptionalProperties?: boolean;
    }) {
        return new GeneratedUnionTypeSchemaImpl({
            typeName: opts.typeName,
            shape: {
                discriminant: opts.discriminant,
                extends: [],
                types: opts.types ?? [],
                baseProperties: opts.baseProperties ?? [],
                discriminatorContext: undefined
            },
            getGeneratedType: createMockGeneratedUnionType,
            getReferenceToGeneratedType: () => ts.factory.createTypeReferenceNode(opts.typeName),
            getReferenceToGeneratedTypeSchema: () => createMockReference(`${opts.typeName}Schema`),
            noOptionalProperties: opts.noOptionalProperties ?? false,
            includeUtilsOnUnionMembers: opts.includeUtilsOnUnionMembers ?? false,
            caseConverter
        });
    }

    function createSingleUnionType(
        discriminantValue: string,
        shape: FernIr.SingleUnionTypeProperties
    ): FernIr.SingleUnionType {
        return {
            discriminantValue: createNameAndWireValue(discriminantValue, discriminantValue),
            shape,
            displayName: undefined,
            docs: undefined,
            availability: undefined
        };
    }

    describe("type property", () => {
        it("has type = 'union'", () => {
            const schema = createUnionSchema({
                typeName: "Shape",
                discriminant: createNameAndWireValue("type", "type")
            });
            expect(schema.type).toBe("union");
        });
    });

    describe("construction", () => {
        it("creates schema with no union types", () => {
            const schema = createUnionSchema({
                typeName: "Empty",
                discriminant: createNameAndWireValue("kind", "kind")
            });
            expect(schema).toBeDefined();
        });

        it("creates schema with noProperties single union type", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties()),
                    createSingleUnionType("hover", FernIr.SingleUnionTypeProperties.noProperties())
                ]
            });
            expect(schema).toBeDefined();
        });

        it("creates schema with samePropertiesAsObject single union type", () => {
            const schema = createUnionSchema({
                typeName: "Shape",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType(
                        "circle",
                        FernIr.SingleUnionTypeProperties.samePropertiesAsObject(createDeclaredTypeName("Circle"))
                    )
                ]
            });
            expect(schema).toBeDefined();
        });

        it("creates schema with singleProperty single union type", () => {
            const schema = createUnionSchema({
                typeName: "Container",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType(
                        "string",
                        FernIr.SingleUnionTypeProperties.singleProperty({
                            name: createNameAndWireValue("value", "value"),
                            type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        })
                    )
                ]
            });
            expect(schema).toBeDefined();
        });

        it("creates schema with mixed union type variants", () => {
            const schema = createUnionSchema({
                typeName: "Response",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType("empty", FernIr.SingleUnionTypeProperties.noProperties()),
                    createSingleUnionType(
                        "data",
                        FernIr.SingleUnionTypeProperties.samePropertiesAsObject(createDeclaredTypeName("DataPayload"))
                    ),
                    createSingleUnionType(
                        "error",
                        FernIr.SingleUnionTypeProperties.singleProperty({
                            name: createNameAndWireValue("message", "message"),
                            type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        })
                    )
                ]
            });
            expect(schema).toBeDefined();
        });

        it("creates schema with base properties", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties())],
                baseProperties: [
                    createObjectProperty("timestamp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });
            expect(schema).toBeDefined();
        });
    });

    describe("writeToFile", () => {
        it("generates schema output for noProperties union types", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties()),
                    createSingleUnionType("hover", FernIr.SingleUnionTypeProperties.noProperties())
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema output for samePropertiesAsObject union type", () => {
            const schema = createUnionSchema({
                typeName: "Shape",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType(
                        "circle",
                        FernIr.SingleUnionTypeProperties.samePropertiesAsObject(createDeclaredTypeName("Circle"))
                    )
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema output for singleProperty union type", () => {
            const schema = createUnionSchema({
                typeName: "Container",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType(
                        "string",
                        FernIr.SingleUnionTypeProperties.singleProperty({
                            name: createNameAndWireValue("value", "value"),
                            type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        })
                    )
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema output for mixed union type variants", () => {
            const schema = createUnionSchema({
                typeName: "Response",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType("empty", FernIr.SingleUnionTypeProperties.noProperties()),
                    createSingleUnionType(
                        "data",
                        FernIr.SingleUnionTypeProperties.samePropertiesAsObject(createDeclaredTypeName("DataPayload"))
                    ),
                    createSingleUnionType(
                        "error",
                        FernIr.SingleUnionTypeProperties.singleProperty({
                            name: createNameAndWireValue("message", "message"),
                            type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        })
                    )
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema output with base properties", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties())],
                baseProperties: [
                    createObjectProperty("timestamp", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ]
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });

        it("generates schema output with includeUtilsOnUnionMembers", () => {
            const schema = createUnionSchema({
                typeName: "Shape",
                discriminant: createNameAndWireValue("type", "type"),
                types: [createSingleUnionType("circle", FernIr.SingleUnionTypeProperties.noProperties())],
                includeUtilsOnUnionMembers: true
            });
            const output = writeSchemaAndGetText(schema);
            expect(output).toMatchSnapshot();
        });
    });

    describe("buildSchema", () => {
        it("builds schema expression for union with noProperties types", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties()),
                    createSingleUnionType("hover", FernIr.SingleUnionTypeProperties.noProperties())
                ]
            });
            const context = createMockContext();
            const builtSchema = schema.buildSchema(context);
            expect(builtSchema).toBeDefined();
            expect(builtSchema.toExpression()).toBeDefined();
        });

        it("builds schema expression for union with singleProperty types", () => {
            const schema = createUnionSchema({
                typeName: "Container",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType(
                        "string",
                        FernIr.SingleUnionTypeProperties.singleProperty({
                            name: createNameAndWireValue("value", "value"),
                            type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        })
                    )
                ]
            });
            const context = createMockContext();
            const builtSchema = schema.buildSchema(context);
            expect(builtSchema).toBeDefined();
            expect(builtSchema.toExpression()).toBeDefined();
        });
    });

    describe("generateRawTypeDeclaration", () => {
        it("generates raw type declaration in module for noProperties union", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties())]
            });
            const context = createMockContext();
            const module = context.sourceFile.addModule({
                name: "Event",
                isExported: true,
                hasDeclareKeyword: true
            });
            schema.generateRawTypeDeclaration(context, module);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates raw type declaration for samePropertiesAsObject union", () => {
            const schema = createUnionSchema({
                typeName: "Shape",
                discriminant: createNameAndWireValue("type", "type"),
                types: [
                    createSingleUnionType(
                        "circle",
                        FernIr.SingleUnionTypeProperties.samePropertiesAsObject(createDeclaredTypeName("Circle"))
                    )
                ]
            });
            const context = createMockContext();
            const module = context.sourceFile.addModule({
                name: "Shape",
                isExported: true,
                hasDeclareKeyword: true
            });
            schema.generateRawTypeDeclaration(context, module);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("writeSchemaToFile", () => {
        it("calls writeSchemaToFile which delegates to generatedUnionSchema", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties())]
            });
            const context = createMockContext();
            schema.writeSchemaToFile(context);
            const output = context.sourceFile.getFullText();
            expect(output).toMatchSnapshot();
        });
    });

    describe("getReferenceToZurgSchema", () => {
        it("returns a Zurg schema reference for the union schema", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties())]
            });
            const context = createMockContext();
            const zurgSchema = schema.getReferenceToZurgSchema(context);
            expect(zurgSchema).toBeDefined();
            expect(zurgSchema.toExpression()).toBeDefined();
        });
    });

    describe("getReferenceToRawShape", () => {
        it("returns a type node referencing the Raw shape", () => {
            const schema = createUnionSchema({
                typeName: "Event",
                discriminant: createNameAndWireValue("type", "type"),
                types: [createSingleUnionType("click", FernIr.SingleUnionTypeProperties.noProperties())]
            });
            const context = createMockContext();
            const rawShape = schema.getReferenceToRawShape(context);
            expect(rawShape).toBeDefined();
        });
    });
});
