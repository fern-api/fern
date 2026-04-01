import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, TypeReferenceNode, Zurg } from "@fern-typescript/commons";
import { caseConverter, casingsGenerator } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";

import { TypeReferenceToParsedTypeNodeConverter } from "../TypeReferenceToParsedTypeNodeConverter.js";
import { TypeReferenceToRawTypeNodeConverter } from "../TypeReferenceToRawTypeNodeConverter.js";
import { TypeReferenceToSchemaConverter } from "../TypeReferenceToSchemaConverter.js";
import { TypeReferenceToStringExpressionConverter } from "../TypeReferenceToStringExpressionConverter.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function primitiveRef(v1: FernIr.PrimitiveTypeV1): FernIr.TypeReference {
    return FernIr.TypeReference.primitive({ v1, v2: undefined });
}

function namedRef(name: string): FernIr.TypeReference {
    return FernIr.TypeReference.named({
        typeId: `type_${name}`,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: casingsGenerator.generateName(name),
        displayName: undefined,
        default: undefined,
        inline: undefined
    });
}

function inlineNamedRef(name: string): FernIr.TypeReference {
    return FernIr.TypeReference.named({
        typeId: `type_${name}`,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: casingsGenerator.generateName(name),
        displayName: undefined,
        default: undefined,
        inline: true
    });
}

function optionalRef(itemType: FernIr.TypeReference): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.optional(itemType));
}

function nullableRef(itemType: FernIr.TypeReference): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.nullable(itemType));
}

function listRef(itemType: FernIr.TypeReference): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.list(itemType));
}

function setRef(itemType: FernIr.TypeReference): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.set(itemType));
}

function mapRef(keyType: FernIr.TypeReference, valueType: FernIr.TypeReference): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.map({ keyType, valueType }));
}

function literalStringRef(value: string): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.string(value)));
}

function literalBooleanRef(value: boolean): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.boolean(value)));
}

function nodeText(node: TypeReferenceNode): string {
    return getTextOfTsNode(node.typeNode);
}

function createMockBaseContext(opts?: {
    resolveTypeReference?: (ref: FernIr.TypeReference) => FernIr.ResolvedTypeReference;
    resolveTypeName?: (name: FernIr.DeclaredTypeName) => FernIr.ResolvedTypeReference;
    getTypeDeclaration?: (name: FernIr.DeclaredTypeName) => FernIr.TypeDeclaration;
    isOptional?: (ref: FernIr.TypeReference) => boolean;
    isNullable?: (ref: FernIr.TypeReference) => boolean;
    needsRequestResponseTypeVariant?: (ref: FernIr.TypeReference) => { request: boolean; response: boolean };
    needsRequestResponseTypeVariantById?: (typeId: string) => { request: boolean; response: boolean };
}) {
    return {
        type: {
            resolveTypeReference:
                opts?.resolveTypeReference ??
                (() => FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })),
            resolveTypeName:
                opts?.resolveTypeName ??
                (() =>
                    FernIr.ResolvedTypeReference.named({
                        name: {
                            typeId: "type_Named",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("Named"),
                            displayName: undefined
                        },
                        shape: FernIr.ShapeType.Object
                    })),
            getTypeDeclaration:
                opts?.getTypeDeclaration ??
                (() => ({
                    name: {
                        typeId: "type_Named",
                        fernFilepath: { allParts: [], packagePath: [], file: undefined },
                        name: casingsGenerator.generateName("Named"),
                        displayName: undefined
                    },
                    shape: FernIr.Type.object({
                        properties: [],
                        extends: [],
                        extraProperties: false,
                        extendedProperties: undefined
                    }),
                    examples: [],
                    referencedTypes: new Set<string>(),
                    inline: undefined,
                    availability: undefined,
                    docs: undefined,
                    encoding: undefined,
                    source: undefined,
                    userProvidedExamples: [],
                    autogeneratedExamples: [],
                    v2Examples: undefined
                })),
            isOptional:
                opts?.isOptional ??
                ((ref: FernIr.TypeReference) => ref.type === "container" && ref.container.type === "optional"),
            isNullable:
                opts?.isNullable ??
                ((ref: FernIr.TypeReference) => ref.type === "container" && ref.container.type === "nullable"),
            needsRequestResponseTypeVariant:
                opts?.needsRequestResponseTypeVariant ??
                (() => ({
                    request: false,
                    response: false
                })),
            needsRequestResponseTypeVariantById:
                opts?.needsRequestResponseTypeVariantById ??
                (() => ({
                    request: false,
                    response: false
                }))
        },
        jsonContext: {
            getReferenceToToJson: () => ({
                getExpression: () => ts.factory.createIdentifier("toJson")
            })
        },
        typeSchema: {
            getSchemaOfNamedType: () => createMockZurgSchema("namedTypeSchema")
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createDefaultInit(contextOverrides?: Parameters<typeof createMockBaseContext>[0]) {
    return {
        context: createMockBaseContext(contextOverrides),
        treatUnknownAsAny: false,
        includeSerdeLayer: true,
        useBigInt: false,
        enableInlineTypes: false,
        allowExtraFields: false,
        omitUndefined: false,
        generateReadWriteOnlyTypes: false
    };
}

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
        parseOrThrow: (raw: ts.Expression) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(exprText), "parseOrThrow"),
                undefined,
                [raw]
            ),
        jsonOrThrow: (parsed: ts.Expression, _opts?: ts.Expression) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(exprText), "jsonOrThrow"),
                undefined,
                [parsed]
            ),
        nullable: () => createMockZurgSchema(`${exprText}.nullable()`),
        optional: () => ({ ...createMockZurgSchema(`${exprText}.optional()`), isOptional: true }),
        optionalNullable: () => ({ ...createMockZurgSchema(`${exprText}.optionalNullable()`), isOptional: true }),
        transform: () => createMockZurgSchema(`${exprText}.transform()`)
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

// ────────────────────────────────────────────────────────────────────────────
// TypeReferenceToSchemaConverter
// ────────────────────────────────────────────────────────────────────────────

describe("TypeReferenceToSchemaConverter", () => {
    function createConverter(opts?: {
        useBigInt?: boolean;
        includeSerdeLayer?: boolean;
        resolveTypeReference?: (ref: FernIr.TypeReference) => FernIr.ResolvedTypeReference;
    }) {
        const init = createDefaultInit({
            resolveTypeReference: opts?.resolveTypeReference
        });
        const zurg: Zurg = {
            string: () => createMockZurgSchema("zurg.string()"),
            number: () => createMockZurgSchema("zurg.number()"),
            bigint: () => createMockZurgSchema("zurg.bigint()"),
            boolean: () => createMockZurgSchema("zurg.boolean()"),
            date: () => createMockZurgSchema("zurg.date()"),
            unknown: () => createMockZurgSchema("zurg.unknown()"),
            any: () => createMockZurgSchema("zurg.any()"),
            list: (schema: Zurg.Schema) => createMockZurgSchema(`zurg.list(${getTextOfTsNode(schema.toExpression())})`),
            set: (schema: Zurg.Schema) => createMockZurgSchema(`zurg.set(${getTextOfTsNode(schema.toExpression())})`),
            stringLiteral: (value: string) => createMockZurgSchema(`zurg.stringLiteral("${value}")`),
            booleanLiteral: (value: boolean) => createMockZurgSchema(`zurg.booleanLiteral(${value})`),
            record: ({ keySchema, valueSchema }: { keySchema: Zurg.Schema; valueSchema: Zurg.Schema }) =>
                createMockZurgSchema(
                    `zurg.record(${getTextOfTsNode(keySchema.toExpression())}, ${getTextOfTsNode(valueSchema.toExpression())})`
                ),
            partialRecord: ({ keySchema, valueSchema }: { keySchema: Zurg.Schema; valueSchema: Zurg.Schema }) =>
                createMockZurgSchema(
                    `zurg.partialRecord(${getTextOfTsNode(keySchema.toExpression())}, ${getTextOfTsNode(valueSchema.toExpression())})`
                )
            // biome-ignore lint/suspicious/noExplicitAny: test mock
        } as any;

        return new TypeReferenceToSchemaConverter({
            ...init,
            useBigInt: opts?.useBigInt ?? false,
            includeSerdeLayer: opts?.includeSerdeLayer ?? true,
            getSchemaOfNamedType: () => createMockZurgSchema("namedSchema"),
            zurg
        });
    }

    describe("primitives", () => {
        it("converts STRING to zurg.string()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("STRING") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string()");
        });

        it("converts INTEGER to zurg.number()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("INTEGER") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.number()");
        });

        it("converts DOUBLE to zurg.number()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("DOUBLE") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.number()");
        });

        it("converts FLOAT to zurg.number()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("FLOAT") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.number()");
        });

        it("converts BOOLEAN to zurg.boolean()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("BOOLEAN") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.boolean()");
        });

        it("converts DATE_TIME to zurg.date()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("DATE_TIME") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.date()");
        });

        it("converts LONG to zurg.number() by default", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("LONG") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.number()");
        });

        it("converts LONG to zurg.bigint() when useBigInt=true", () => {
            const converter = createConverter({ useBigInt: true });
            const result = converter.convert({ typeReference: primitiveRef("LONG") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.bigint()");
        });

        it("converts BIG_INTEGER to zurg.string() by default", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("BIG_INTEGER") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string()");
        });

        it("converts BIG_INTEGER to zurg.bigint() when useBigInt=true", () => {
            const converter = createConverter({ useBigInt: true });
            const result = converter.convert({ typeReference: primitiveRef("BIG_INTEGER") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.bigint()");
        });

        it("converts UUID to zurg.string()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("UUID") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string()");
        });

        it("converts DATE to zurg.string()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("DATE") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string()");
        });

        it("converts BASE64 to zurg.string()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("BASE_64") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string()");
        });

        it("converts UINT to zurg.number()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("UINT") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.number()");
        });

        it("converts UINT64 to zurg.number()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: primitiveRef("UINT_64") });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.number()");
        });
    });

    describe("containers", () => {
        it("converts list to zurg.list()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: listRef(primitiveRef("STRING")) });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.list(zurg.string())");
        });

        it("converts set with primitive to zurg.set()", () => {
            const converter = createConverter({
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
            });
            const result = converter.convert({ typeReference: setRef(primitiveRef("STRING")) });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.set(zurg.string())");
        });

        it("converts set with non-primitive to list", () => {
            const converter = createConverter({
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.named({
                        name: {
                            typeId: "type_User",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("User"),
                            displayName: undefined
                        },
                        shape: FernIr.ShapeType.Object
                    })
            });
            const result = converter.convert({ typeReference: setRef(namedRef("User")) });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.list(namedSchema)");
        });

        it("converts optional to .optional()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: optionalRef(primitiveRef("STRING")) });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string().optional()");
            expect(result.isOptional).toBe(true);
        });

        it("converts nullable to .nullable()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: nullableRef(primitiveRef("STRING")) });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string().nullable()");
        });

        it("converts nullable(optional) to .optionalNullable()", () => {
            const converter = createConverter();
            const result = converter.convert({
                typeReference: nullableRef(optionalRef(primitiveRef("STRING")))
            });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string().optionalNullable()");
        });

        it("converts optional(nullable) to .optionalNullable()", () => {
            const converter = createConverter();
            const result = converter.convert({
                typeReference: optionalRef(nullableRef(primitiveRef("STRING")))
            });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.string().optionalNullable()");
        });

        it("converts map with non-enum keys to zurg.record()", () => {
            const converter = createConverter({
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
            });
            const result = converter.convert({
                typeReference: mapRef(primitiveRef("STRING"), primitiveRef("INTEGER"))
            });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.record(zurg.string(), zurg.number())");
        });

        it("converts map with enum keys to zurg.partialRecord()", () => {
            const converter = createConverter({
                resolveTypeReference: (ref) => {
                    if (ref.type === "named") {
                        return FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: ref.typeId,
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Status"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.Enum
                        });
                    }
                    return FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined });
                }
            });
            const result = converter.convert({
                typeReference: mapRef(namedRef("Status"), primitiveRef("STRING"))
            });
            expect(getTextOfTsNode(result.toExpression())).toContain("zurg.partialRecord");
        });

        it("converts string literal", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: literalStringRef("hello") });
            expect(getTextOfTsNode(result.toExpression())).toBe('zurg.stringLiteral("hello")');
        });

        it("converts boolean literal", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: literalBooleanRef(true) });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.booleanLiteral(true)");
        });
    });

    describe("named and special types", () => {
        it("converts named type to named schema", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: namedRef("User") });
            expect(getTextOfTsNode(result.toExpression())).toBe("namedSchema");
        });

        it("converts unknown to zurg.unknown()", () => {
            const converter = createConverter();
            const result = converter.convert({ typeReference: FernIr.TypeReference.unknown() });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.unknown()");
        });

        it("converts unknown to zurg.any() when treatUnknownAsAny=true", () => {
            const init = createDefaultInit();
            const zurg: Zurg = {
                any: () => createMockZurgSchema("zurg.any()"),
                unknown: () => createMockZurgSchema("zurg.unknown()")
                // biome-ignore lint/suspicious/noExplicitAny: test mock
            } as any;
            const converter = new TypeReferenceToSchemaConverter({
                ...init,
                treatUnknownAsAny: true,
                getSchemaOfNamedType: () => createMockZurgSchema("namedSchema"),
                zurg
            });
            const result = converter.convert({ typeReference: FernIr.TypeReference.unknown() });
            expect(getTextOfTsNode(result.toExpression())).toBe("zurg.any()");
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// TypeReferenceToParsedTypeNodeConverter
// ────────────────────────────────────────────────────────────────────────────

describe("TypeReferenceToParsedTypeNodeConverter", () => {
    function createConverter(opts?: {
        useBigInt?: boolean;
        includeSerdeLayer?: boolean;
        enableInlineTypes?: boolean;
        generateReadWriteOnlyTypes?: boolean;
        resolveTypeReference?: (ref: FernIr.TypeReference) => FernIr.ResolvedTypeReference;
        resolveTypeName?: (name: FernIr.DeclaredTypeName) => FernIr.ResolvedTypeReference;
        needsRequestResponseTypeVariant?: (ref: FernIr.TypeReference) => { request: boolean; response: boolean };
        needsRequestResponseTypeVariantById?: (typeId: string) => { request: boolean; response: boolean };
        getTypeDeclaration?: (name: FernIr.DeclaredTypeName) => FernIr.TypeDeclaration;
    }) {
        const init = createDefaultInit({
            resolveTypeReference: opts?.resolveTypeReference,
            resolveTypeName: opts?.resolveTypeName,
            needsRequestResponseTypeVariant: opts?.needsRequestResponseTypeVariant,
            needsRequestResponseTypeVariantById: opts?.needsRequestResponseTypeVariantById,
            getTypeDeclaration: opts?.getTypeDeclaration
        });
        return new TypeReferenceToParsedTypeNodeConverter({
            ...init,
            useBigInt: opts?.useBigInt ?? false,
            includeSerdeLayer: opts?.includeSerdeLayer ?? true,
            enableInlineTypes: opts?.enableInlineTypes ?? false,
            generateReadWriteOnlyTypes: opts?.generateReadWriteOnlyTypes ?? false,
            getReferenceToNamedType: (typeName) => ts.factory.createIdentifier(caseConverter.pascalSafe(typeName.name)),
            generateForInlineUnion: (typeName) => ({
                typeNode: ts.factory.createTypeReferenceNode(caseConverter.pascalSafe(typeName.name)),
                requestTypeNode: undefined,
                responseTypeNode: undefined
            })
        });
    }

    describe("primitives", () => {
        it("converts STRING to string", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("STRING") });
            expect(nodeText(result)).toBe("string");
            expect(result.isOptional).toBe(false);
        });

        it("converts INTEGER to number", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("INTEGER") });
            expect(nodeText(result)).toBe("number");
        });

        it("converts BOOLEAN to boolean", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("BOOLEAN") });
            expect(nodeText(result)).toBe("boolean");
        });

        it("converts DATE_TIME to Date when includeSerdeLayer=true", () => {
            const result = createConverter({ includeSerdeLayer: true }).convert({
                typeReference: primitiveRef("DATE_TIME")
            });
            expect(nodeText(result)).toBe("Date");
        });

        it("converts DATE_TIME to string when includeSerdeLayer=false", () => {
            const result = createConverter({ includeSerdeLayer: false }).convert({
                typeReference: primitiveRef("DATE_TIME")
            });
            expect(nodeText(result)).toBe("string");
        });

        it("converts LONG to number by default", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("LONG") });
            expect(nodeText(result)).toBe("number");
        });

        it("converts LONG to bigint when useBigInt + includeSerdeLayer", () => {
            const result = createConverter({ useBigInt: true, includeSerdeLayer: true }).convert({
                typeReference: primitiveRef("LONG")
            });
            expect(nodeText(result)).toBe("bigint");
        });

        it("converts LONG to number | bigint when useBigInt + no serde", () => {
            const result = createConverter({ useBigInt: true, includeSerdeLayer: false }).convert({
                typeReference: primitiveRef("LONG")
            });
            expect(nodeText(result)).toBe("number | bigint");
        });

        it("converts BIG_INTEGER to string by default", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("BIG_INTEGER") });
            expect(nodeText(result)).toBe("string");
        });

        it("converts BIG_INTEGER to bigint when useBigInt + includeSerdeLayer", () => {
            const result = createConverter({ useBigInt: true, includeSerdeLayer: true }).convert({
                typeReference: primitiveRef("BIG_INTEGER")
            });
            expect(nodeText(result)).toBe("bigint");
        });

        it("converts BIG_INTEGER to number | bigint when useBigInt + no serde", () => {
            const result = createConverter({ useBigInt: true, includeSerdeLayer: false }).convert({
                typeReference: primitiveRef("BIG_INTEGER")
            });
            expect(nodeText(result)).toBe("number | bigint");
        });

        it("converts UUID to string", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("UUID") });
            expect(nodeText(result)).toBe("string");
        });

        it("converts DATE to string", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("DATE") });
            expect(nodeText(result)).toBe("string");
        });

        it("converts BASE64 to string", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("BASE_64") });
            expect(nodeText(result)).toBe("string");
        });
    });

    describe("containers", () => {
        it("converts list to array type", () => {
            const result = createConverter().convert({ typeReference: listRef(primitiveRef("STRING")) });
            expect(nodeText(result)).toBe("string[]");
        });

        it("converts set with primitive to Set<T> when includeSerdeLayer=true", () => {
            const result = createConverter({
                includeSerdeLayer: true,
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
            }).convert({ typeReference: setRef(primitiveRef("STRING")) });
            expect(nodeText(result)).toBe("Set<string>");
        });

        it("converts set with non-primitive to array (falls back to list)", () => {
            const result = createConverter({
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.named({
                        name: {
                            typeId: "type_User",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("User"),
                            displayName: undefined
                        },
                        shape: FernIr.ShapeType.Object
                    })
            }).convert({ typeReference: setRef(namedRef("User")) });
            expect(nodeText(result)).toContain("[]");
        });

        it("converts set with primitive but no serde to array", () => {
            const result = createConverter({
                includeSerdeLayer: false,
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
            }).convert({ typeReference: setRef(primitiveRef("STRING")) });
            expect(nodeText(result)).toContain("[]");
        });

        it("converts optional to T | undefined", () => {
            const result = createConverter().convert({
                typeReference: optionalRef(primitiveRef("STRING"))
            });
            expect(nodeText(result)).toBe("string | undefined");
            expect(result.isOptional).toBe(true);
        });

        it("converts nullable to T | null", () => {
            const result = createConverter().convert({
                typeReference: nullableRef(primitiveRef("STRING"))
            });
            expect(nodeText(result)).toBe("string | null");
            expect(result.isOptional).toBe(false);
        });

        it("converts map to Record type", () => {
            const result = createConverter({
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
            }).convert({
                typeReference: mapRef(primitiveRef("STRING"), primitiveRef("INTEGER"))
            });
            expect(nodeText(result)).toBe("Record<string, number>");
        });

        it("converts map with enum keys to Partial<Record>", () => {
            const result = createConverter({
                resolveTypeReference: (ref) => {
                    if (ref.type === "named") {
                        return FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: ref.typeId,
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Status"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.Enum
                        });
                    }
                    return FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined });
                }
            }).convert({
                typeReference: mapRef(namedRef("Status"), primitiveRef("STRING"))
            });
            expect(nodeText(result)).toContain("Partial");
        });

        it("converts string literal to literal type", () => {
            const result = createConverter().convert({ typeReference: literalStringRef("hello") });
            expect(nodeText(result)).toBe('"hello"');
        });

        it("converts boolean literal true", () => {
            const result = createConverter().convert({ typeReference: literalBooleanRef(true) });
            expect(nodeText(result)).toBe("true");
        });

        it("converts boolean literal false", () => {
            const result = createConverter().convert({ typeReference: literalBooleanRef(false) });
            expect(nodeText(result)).toBe("false");
        });
    });

    describe("named types", () => {
        it("converts named type to type reference", () => {
            const result = createConverter().convert({ typeReference: namedRef("User") });
            expect(nodeText(result)).toBe("User");
        });

        it("marks named type as optional when resolved type is optional container", () => {
            const result = createConverter({
                resolveTypeName: () =>
                    FernIr.ResolvedTypeReference.container(FernIr.ContainerType.optional(primitiveRef("STRING")))
            }).convert({ typeReference: namedRef("MaybeString") });
            expect(result.isOptional).toBe(true);
            expect(nodeText(result)).toContain("undefined");
        });
    });

    describe("special types", () => {
        it("converts unknown to unknown (isOptional=true)", () => {
            const result = createConverter().convert({ typeReference: FernIr.TypeReference.unknown() });
            expect(nodeText(result)).toBe("unknown");
            expect(result.isOptional).toBe(true);
        });

        it("converts unknown to any when treatUnknownAsAny=true", () => {
            const init = createDefaultInit();
            const converter = new TypeReferenceToParsedTypeNodeConverter({
                ...init,
                treatUnknownAsAny: true,
                getReferenceToNamedType: (typeName) =>
                    ts.factory.createIdentifier(caseConverter.pascalSafe(typeName.name)),
                generateForInlineUnion: (typeName) => ({
                    typeNode: ts.factory.createTypeReferenceNode(caseConverter.pascalSafe(typeName.name)),
                    requestTypeNode: undefined,
                    responseTypeNode: undefined
                })
            });
            const result = converter.convert({ typeReference: FernIr.TypeReference.unknown() });
            expect(nodeText(result)).toBe("any");
        });
    });

    describe("inline types with enableInlineTypes", () => {
        it("generates inline property type reference", () => {
            const converter = createConverter({
                enableInlineTypes: true,
                getTypeDeclaration: () =>
                    ({
                        inline: true,
                        name: {
                            typeId: "type_Nested",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("Nested")
                        },
                        shape: FernIr.Type.object({
                            properties: [],
                            extends: [],
                            extraProperties: false,
                            extendedProperties: undefined
                        })
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                    }) as any
            });
            const result = converter.convert({
                type: "inlinePropertyParams",
                typeReference: inlineNamedRef("Nested"),
                parentTypeName: "Parent",
                propertyName: "nested"
            });
            expect(nodeText(result)).toBe("Parent.nested");
        });

        it("generates inline alias type reference with list genericIn", () => {
            const converter = createConverter({
                enableInlineTypes: true,
                getTypeDeclaration: () =>
                    ({
                        inline: true,
                        name: {
                            typeId: "type_Item",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("Item")
                        },
                        shape: FernIr.Type.object({
                            properties: [],
                            extends: [],
                            extraProperties: false,
                            extendedProperties: undefined
                        })
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                    }) as any
            });
            const result = converter.convert({
                type: "inlineAliasParams",
                typeReference: inlineNamedRef("Item"),
                aliasTypeName: "Items",
                genericIn: "list"
            });
            expect(nodeText(result)).toBe("Items.Item");
        });

        it("generates inline forInlineUnion type reference", () => {
            const converter = createConverter({
                enableInlineTypes: true,
                getTypeDeclaration: () =>
                    ({
                        inline: true,
                        name: {
                            typeId: "type_Variant",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("Variant")
                        },
                        shape: FernIr.Type.object({
                            properties: [],
                            extends: [],
                            extraProperties: false,
                            extendedProperties: undefined
                        })
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                    }) as any
            });
            const result = converter.convert({
                type: "forInlineUnionParams",
                typeReference: inlineNamedRef("Variant")
            });
            expect(nodeText(result)).toBe("Variant");
        });
    });

    describe("request/response type variants", () => {
        it("adds Request type node when needsRequestResponseTypeVariantById returns request=true", () => {
            const converter = createConverter({
                generateReadWriteOnlyTypes: true,
                needsRequestResponseTypeVariantById: () => ({ request: true, response: false })
            });
            const result = converter.convert({ typeReference: namedRef("User") });
            assert(result.requestTypeNode != null, "requestTypeNode should be defined");
            expect(getTextOfTsNode(result.requestTypeNode)).toBe("User.Request");
        });

        it("adds Response type node when needsRequestResponseTypeVariantById returns response=true", () => {
            const converter = createConverter({
                generateReadWriteOnlyTypes: true,
                needsRequestResponseTypeVariantById: () => ({ request: false, response: true })
            });
            const result = converter.convert({ typeReference: namedRef("User") });
            assert(result.responseTypeNode != null, "responseTypeNode should be defined");
            expect(getTextOfTsNode(result.responseTypeNode)).toBe("User.Response");
        });

        it("does not add request/response nodes when generateReadWriteOnlyTypes=false", () => {
            const converter = createConverter({
                generateReadWriteOnlyTypes: false,
                needsRequestResponseTypeVariantById: () => ({ request: true, response: true })
            });
            const result = converter.convert({ typeReference: namedRef("User") });
            expect(result.requestTypeNode).toBeUndefined();
            expect(result.responseTypeNode).toBeUndefined();
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// TypeReferenceToRawTypeNodeConverter
// ────────────────────────────────────────────────────────────────────────────

describe("TypeReferenceToRawTypeNodeConverter", () => {
    function createConverter(opts?: {
        useBigInt?: boolean;
        generateReadWriteOnlyTypes?: boolean;
        resolveTypeReference?: (ref: FernIr.TypeReference) => FernIr.ResolvedTypeReference;
        resolveTypeName?: (name: FernIr.DeclaredTypeName) => FernIr.ResolvedTypeReference;
        needsRequestResponseTypeVariant?: (ref: FernIr.TypeReference) => { request: boolean; response: boolean };
        needsRequestResponseTypeVariantById?: (typeId: string) => { request: boolean; response: boolean };
    }) {
        const init = createDefaultInit({
            resolveTypeReference: opts?.resolveTypeReference,
            resolveTypeName: opts?.resolveTypeName,
            needsRequestResponseTypeVariant: opts?.needsRequestResponseTypeVariant,
            needsRequestResponseTypeVariantById: opts?.needsRequestResponseTypeVariantById
        });
        return new TypeReferenceToRawTypeNodeConverter({
            ...init,
            useBigInt: opts?.useBigInt ?? false,
            generateReadWriteOnlyTypes: opts?.generateReadWriteOnlyTypes ?? false,
            getReferenceToNamedType: (typeName) => ts.factory.createIdentifier(caseConverter.pascalSafe(typeName.name)),
            generateForInlineUnion: (typeName) => ({
                typeNode: ts.factory.createTypeReferenceNode(caseConverter.pascalSafe(typeName.name)),
                requestTypeNode: undefined,
                responseTypeNode: undefined
            })
        });
    }

    describe("primitives", () => {
        it("converts STRING to string", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("STRING") });
            expect(nodeText(result)).toBe("string");
        });

        it("converts INTEGER to number", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("INTEGER") });
            expect(nodeText(result)).toBe("number");
        });

        it("converts DATE_TIME to string (always raw)", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("DATE_TIME") });
            expect(nodeText(result)).toBe("string");
        });

        it("converts LONG to number by default", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("LONG") });
            expect(nodeText(result)).toBe("number");
        });

        it("converts LONG to bigint | number when useBigInt", () => {
            const result = createConverter({ useBigInt: true }).convert({
                typeReference: primitiveRef("LONG")
            });
            expect(nodeText(result)).toBe("bigint | number");
        });

        it("converts BIG_INTEGER to string by default", () => {
            const result = createConverter().convert({ typeReference: primitiveRef("BIG_INTEGER") });
            expect(nodeText(result)).toBe("string");
        });

        it("converts BIG_INTEGER to bigint | number when useBigInt", () => {
            const result = createConverter({ useBigInt: true }).convert({
                typeReference: primitiveRef("BIG_INTEGER")
            });
            expect(nodeText(result)).toBe("bigint | number");
        });
    });

    describe("containers", () => {
        it("converts set to array type (always raw)", () => {
            const result = createConverter().convert({ typeReference: setRef(primitiveRef("STRING")) });
            expect(nodeText(result)).toBe("string[]");
        });

        it("converts optional to T | null | undefined", () => {
            const result = createConverter().convert({
                typeReference: optionalRef(primitiveRef("STRING"))
            });
            expect(nodeText(result)).toBe("string | null | undefined");
            expect(result.isOptional).toBe(true);
        });

        it("converts nullable to T | null | undefined (same as optional in raw)", () => {
            const result = createConverter().convert({
                typeReference: nullableRef(primitiveRef("STRING"))
            });
            expect(nodeText(result)).toBe("string | null | undefined");
            expect(result.isOptional).toBe(true);
        });

        it("typeNodeWithoutUndefined excludes undefined but keeps null for optional", () => {
            const result = createConverter().convert({
                typeReference: optionalRef(primitiveRef("STRING"))
            });
            expect(getTextOfTsNode(result.typeNodeWithoutUndefined)).toBe("string | null");
        });

        it("converts map with non-enum keys to Record", () => {
            const result = createConverter({
                resolveTypeReference: () =>
                    FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
            }).convert({
                typeReference: mapRef(primitiveRef("STRING"), primitiveRef("INTEGER"))
            });
            expect(nodeText(result)).toBe("Record<string, number>");
        });

        it("converts map with enum keys to Record with optional values", () => {
            const result = createConverter({
                resolveTypeReference: (ref) => {
                    if (ref.type === "named") {
                        return FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: ref.typeId,
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Status"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.Enum
                        });
                    }
                    return FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined });
                }
            }).convert({
                typeReference: mapRef(namedRef("Status"), primitiveRef("STRING"))
            });
            // Raw mapWithOptionalValues wraps values in optional (T | null | undefined)
            expect(nodeText(result)).toContain("Record");
        });
    });

    describe("special types", () => {
        it("converts unknown to unknown", () => {
            const result = createConverter().convert({ typeReference: FernIr.TypeReference.unknown() });
            expect(nodeText(result)).toBe("unknown");
            expect(result.isOptional).toBe(true);
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// TypeReferenceToStringExpressionConverter
// ────────────────────────────────────────────────────────────────────────────

describe("TypeReferenceToStringExpressionConverter", () => {
    function createConverter(opts?: {
        useBigInt?: boolean;
        includeSerdeLayer?: boolean;
        resolveTypeReference?: (ref: FernIr.TypeReference) => FernIr.ResolvedTypeReference;
        resolveTypeName?: (name: FernIr.DeclaredTypeName) => FernIr.ResolvedTypeReference;
        isOptional?: (ref: FernIr.TypeReference) => boolean;
        isNullable?: (ref: FernIr.TypeReference) => boolean;
    }) {
        const init = createDefaultInit({
            resolveTypeReference: opts?.resolveTypeReference,
            resolveTypeName: opts?.resolveTypeName,
            isOptional: opts?.isOptional,
            isNullable: opts?.isNullable
        });
        return new TypeReferenceToStringExpressionConverter({
            ...init,
            useBigInt: opts?.useBigInt ?? false,
            includeSerdeLayer: opts?.includeSerdeLayer ?? true
        });
    }

    function applyAndGetText(
        converter: TypeReferenceToStringExpressionConverter,
        typeRef: FernIr.TypeReference,
        refName = "value"
    ): string {
        const fn = converter.convert({ typeReference: typeRef });
        return getTextOfTsNode(fn(ts.factory.createIdentifier(refName)));
    }

    describe("primitives", () => {
        it("string returns reference as-is", () => {
            expect(applyAndGetText(createConverter(), primitiveRef("STRING"))).toBe("value");
        });

        it("number calls .toString()", () => {
            expect(applyAndGetText(createConverter(), primitiveRef("INTEGER"))).toBe("value.toString()");
        });

        it("boolean calls .toString()", () => {
            expect(applyAndGetText(createConverter(), primitiveRef("BOOLEAN"))).toBe("value.toString()");
        });

        it("long calls .toString()", () => {
            expect(applyAndGetText(createConverter(), primitiveRef("LONG"))).toBe("value.toString()");
        });

        it("dateTime calls .toISOString() with serde layer", () => {
            expect(applyAndGetText(createConverter({ includeSerdeLayer: true }), primitiveRef("DATE_TIME"))).toBe(
                "value.toISOString()"
            );
        });

        it("dateTime returns as-is without serde layer", () => {
            expect(applyAndGetText(createConverter({ includeSerdeLayer: false }), primitiveRef("DATE_TIME"))).toBe(
                "value"
            );
        });

        it("bigInteger returns as-is (string) by default", () => {
            expect(applyAndGetText(createConverter(), primitiveRef("BIG_INTEGER"))).toBe("value");
        });

        it("bigInteger calls .toString() when useBigInt=true", () => {
            expect(applyAndGetText(createConverter({ useBigInt: true }), primitiveRef("BIG_INTEGER"))).toBe(
                "value.toString()"
            );
        });
    });

    describe("containers", () => {
        it("list uses JSON.stringify", () => {
            const result = applyAndGetText(createConverter(), listRef(primitiveRef("STRING")));
            expect(result).toBe("toJson(value)");
        });

        it("set uses JSON.stringify", () => {
            const result = applyAndGetText(createConverter(), setRef(primitiveRef("STRING")));
            expect(result).toBe("toJson(value)");
        });

        it("map with non-enum keys uses JSON.stringify", () => {
            const result = applyAndGetText(
                createConverter({
                    resolveTypeReference: () =>
                        FernIr.ResolvedTypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
                }),
                mapRef(primitiveRef("STRING"), primitiveRef("INTEGER"))
            );
            expect(result).toBe("toJson(value)");
        });

        it("map with enum keys uses JSON.stringify", () => {
            const result = applyAndGetText(
                createConverter({
                    resolveTypeReference: (ref) => {
                        if (ref.type === "named") {
                            return FernIr.ResolvedTypeReference.named({
                                name: {
                                    typeId: "type_Status",
                                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                    name: casingsGenerator.generateName("Status"),
                                    displayName: undefined
                                },
                                shape: FernIr.ShapeType.Enum
                            });
                        }
                        return FernIr.ResolvedTypeReference.primitive({
                            v1: FernIr.PrimitiveTypeV1.String,
                            v2: undefined
                        });
                    }
                }),
                mapRef(namedRef("Status"), primitiveRef("STRING"))
            );
            expect(result).toBe("toJson(value)");
        });

        it("string literal returns as-is", () => {
            const result = applyAndGetText(createConverter(), literalStringRef("hello"));
            expect(result).toBe("value");
        });

        it("boolean literal calls .toString()", () => {
            const result = applyAndGetText(createConverter(), literalBooleanRef(true));
            expect(result).toBe("value.toString()");
        });

        it("optional propagates nullable flag for null-safe call", () => {
            const result = applyAndGetText(createConverter(), optionalRef(primitiveRef("INTEGER")));
            // optional(number) → number?.toString()
            expect(result).toContain("toString");
        });

        it("nullable propagates nullable flag for null-safe call", () => {
            const result = applyAndGetText(createConverter(), nullableRef(primitiveRef("INTEGER")));
            expect(result).toContain("toString");
        });
    });

    describe("named types", () => {
        it("named enum returns as-is (without serde)", () => {
            const result = applyAndGetText(
                createConverter({
                    includeSerdeLayer: false,
                    resolveTypeName: () =>
                        FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: "type_Status",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Status"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.Enum
                        })
                }),
                namedRef("Status")
            );
            expect(result).toBe("value");
        });

        it("named object uses JSON.stringify (without serde)", () => {
            const result = applyAndGetText(
                createConverter({
                    includeSerdeLayer: false,
                    resolveTypeName: () =>
                        FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: "type_User",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("User"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.Object
                        })
                }),
                namedRef("User")
            );
            expect(result).toBe("toJson(value)");
        });

        it("named undiscriminated union uses typeof check (without serde)", () => {
            const result = applyAndGetText(
                createConverter({
                    includeSerdeLayer: false,
                    resolveTypeName: () =>
                        FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: "type_Value",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Value"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.UndiscriminatedUnion
                        })
                }),
                namedRef("Value")
            );
            expect(result).toContain("typeof");
            expect(result).toContain("string");
        });

        it("named type with serde uses jsonOrThrow", () => {
            const result = applyAndGetText(
                createConverter({
                    includeSerdeLayer: true,
                    resolveTypeName: () =>
                        FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: "type_User",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("User"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.Object
                        })
                }),
                namedRef("User")
            );
            expect(result).toContain("jsonOrThrow");
        });

        it("named enum with serde uses jsonOrThrow but returns directly", () => {
            const result = applyAndGetText(
                createConverter({
                    includeSerdeLayer: true,
                    resolveTypeName: () =>
                        FernIr.ResolvedTypeReference.named({
                            name: {
                                typeId: "type_Status",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Status"),
                                displayName: undefined
                            },
                            shape: FernIr.ShapeType.Enum
                        })
                }),
                namedRef("Status")
            );
            // enum with serde returns jsonOrThrow result directly (no JSON.stringify wrapping)
            expect(result).toContain("jsonOrThrow");
        });
    });

    describe("special types", () => {
        it("unknown uses typeof string check", () => {
            const result = applyAndGetText(createConverter(), FernIr.TypeReference.unknown());
            expect(result).toContain("typeof");
            expect(result).toContain("string");
        });

        it("any (treatUnknownAsAny) uses typeof string check", () => {
            const init = createDefaultInit();
            const converter = new TypeReferenceToStringExpressionConverter({
                ...init,
                treatUnknownAsAny: true
            });
            const fn = converter.convert({ typeReference: FernIr.TypeReference.unknown() });
            const result = getTextOfTsNode(fn(ts.factory.createIdentifier("value")));
            expect(result).toContain("typeof");
        });
    });

    describe("convertWithNullCheckIfOptional", () => {
        it("returns convert result directly for non-optional non-nullable", () => {
            const converter = createConverter();
            const fn = converter.convertWithNullCheckIfOptional({
                typeReference: primitiveRef("INTEGER")
            });
            const result = getTextOfTsNode(fn(ts.factory.createIdentifier("val")));
            expect(result).toBe("val.toString()");
        });

        it("wraps with !== undefined check for nullable reference", () => {
            const converter = createConverter({
                isNullable: () => true
            });
            const fn = converter.convertWithNullCheckIfOptional({
                typeReference: nullableRef(primitiveRef("INTEGER"))
            });
            const result = getTextOfTsNode(fn(ts.factory.createIdentifier("val")));
            expect(result).toContain("!== undefined");
            expect(result).toContain("toString");
        });

        it("wraps with != null check for optional (non-nullable) reference", () => {
            const converter = createConverter({
                isNullable: () => false,
                isOptional: () => true
            });
            const fn = converter.convertWithNullCheckIfOptional({
                typeReference: optionalRef(primitiveRef("INTEGER"))
            });
            const result = getTextOfTsNode(fn(ts.factory.createIdentifier("val")));
            expect(result).toContain("!= null");
        });
    });

    describe("nullable/optional parameter propagation", () => {
        it("number with nullable param uses optional chaining", () => {
            const converter = createConverter();
            const fn = converter.convert({
                typeReference: primitiveRef("INTEGER"),
                nullable: true
            });
            const result = getTextOfTsNode(fn(ts.factory.createIdentifier("val")));
            expect(result).toBe("val?.toString()");
        });

        it("boolean with optional param uses optional chaining", () => {
            const converter = createConverter();
            const fn = converter.convert({
                typeReference: primitiveRef("BOOLEAN"),
                optional: true
            });
            const result = getTextOfTsNode(fn(ts.factory.createIdentifier("val")));
            expect(result).toBe("val?.toString()");
        });
    });
});
