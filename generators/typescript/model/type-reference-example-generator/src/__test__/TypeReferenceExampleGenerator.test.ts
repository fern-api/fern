import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { casingsGenerator } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedTypeReferenceExampleImpl } from "../GeneratedTypeReferenceExampleImpl.js";
import { TypeReferenceExampleGenerator } from "../TypeReferenceExampleGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockBaseContext(opts?: { includeSerdeLayer?: boolean }) {
    return {
        includeSerdeLayer: opts?.includeSerdeLayer ?? true,
        type: {
            getGeneratedType: () => ({
                type: "enum",
                buildExample: (_example: unknown, _context: unknown, _opts: unknown) =>
                    ts.factory.createStringLiteral("ENUM_VALUE")
            }),
            resolveTypeReference: () => ({
                type: "primitive" as const,
                primitive: FernIr.PrimitiveTypeV1.String
            })
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createStringExample(value: string): FernIr.ExampleTypeReference {
    return {
        jsonExample: `"${value}"`,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.string({ original: value }))
    };
}

function createIntExample(value: number): FernIr.ExampleTypeReference {
    return {
        jsonExample: value,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.integer(value))
    };
}

function createDoubleExample(value: number): FernIr.ExampleTypeReference {
    return {
        jsonExample: value,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.double(value))
    };
}

function createLongExample(value: number): FernIr.ExampleTypeReference {
    return {
        jsonExample: value,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.long(value))
    };
}

function createBoolExample(value: boolean): FernIr.ExampleTypeReference {
    return {
        jsonExample: value,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.boolean(value))
    };
}

function createUuidExample(value: string): FernIr.ExampleTypeReference {
    return {
        jsonExample: `"${value}"`,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.uuid(value))
    };
}

function createDatetimeExample(date: Date): FernIr.ExampleTypeReference {
    return {
        jsonExample: date.toISOString(),
        shape: FernIr.ExampleTypeReferenceShape.primitive(
            FernIr.ExamplePrimitive.datetime({ datetime: date, raw: undefined })
        )
    };
}

function createDateExample(value: string): FernIr.ExampleTypeReference {
    return {
        jsonExample: `"${value}"`,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.date(value))
    };
}

function createBase64Example(value: string): FernIr.ExampleTypeReference {
    return {
        jsonExample: `"${value}"`,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.base64(value))
    };
}

function createBigIntegerExample(value: string): FernIr.ExampleTypeReference {
    return {
        jsonExample: `"${value}"`,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.bigInteger(value))
    };
}

function createUintExample(value: number): FernIr.ExampleTypeReference {
    return {
        jsonExample: value,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.uint(value))
    };
}

function createUint64Example(value: number): FernIr.ExampleTypeReference {
    return {
        jsonExample: value,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.uint64(value))
    };
}

function createFloatExample(value: number): FernIr.ExampleTypeReference {
    return {
        jsonExample: value,
        shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.float(value))
    };
}

const DEFAULT_OPTS = { isForComment: false, isForTypeDeclarationComment: false };

// ────────────────────────────────────────────────────────────────────────────
// TypeReferenceExampleGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("TypeReferenceExampleGenerator", () => {
    it("creates GeneratedTypeReferenceExampleImpl", () => {
        const generator = new TypeReferenceExampleGenerator({
            useBigInt: false,
            includeSerdeLayer: true
        });
        const result = generator.generateExample(createStringExample("hello"));
        expect(result).toBeDefined();
    });

    it("passes flags through to implementation", () => {
        const generator = new TypeReferenceExampleGenerator({
            useBigInt: true,
            includeSerdeLayer: false
        });
        const result = generator.generateExample(createLongExample(123));
        const context = createMockBaseContext();
        const expr = result.build(context, DEFAULT_OPTS);
        // With useBigInt=true, long should produce BigInt() call
        expect(getTextOfTsNode(expr)).toContain("BigInt");
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedTypeReferenceExampleImpl — Primitives
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedTypeReferenceExampleImpl", () => {
    function createImpl(
        example: FernIr.ExampleTypeReference,
        opts?: { useBigInt?: boolean; includeSerdeLayer?: boolean }
    ) {
        return new GeneratedTypeReferenceExampleImpl({
            example,
            useBigInt: opts?.useBigInt ?? false,
            includeSerdeLayer: opts?.includeSerdeLayer ?? true
        });
    }

    describe("primitives", () => {
        it("generates string literal", () => {
            const impl = createImpl(createStringExample("hello world"));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"hello world"');
        });

        it("generates string literal for comment (escapes */)", () => {
            const impl = createImpl(createStringExample("value with */ inside"));
            const context = createMockBaseContext();
            const expr = impl.build(context, { isForComment: true, isForTypeDeclarationComment: false });
            expect(getTextOfTsNode(expr)).toContain("* /");
        });

        it("generates integer literal", () => {
            const impl = createImpl(createIntExample(42));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("42");
        });

        it("generates double literal", () => {
            const impl = createImpl(createDoubleExample(3.14));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("3.14");
        });

        it("generates long as number when useBigInt is false", () => {
            const impl = createImpl(createLongExample(999999));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("999999");
        });

        it("generates long as BigInt when useBigInt is true", () => {
            const impl = createImpl(createLongExample(999999), { useBigInt: true });
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toContain("BigInt");
        });

        it("generates uint literal", () => {
            const impl = createImpl(createUintExample(42));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("42");
        });

        it("generates uint64 literal", () => {
            const impl = createImpl(createUint64Example(100));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("100");
        });

        it("generates float literal", () => {
            const impl = createImpl(createFloatExample(1.5));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("1.5");
        });

        it("generates bigInteger as string when useBigInt is false", () => {
            const impl = createImpl(createBigIntegerExample("123456789012345678901234567890"));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"123456789012345678901234567890"');
        });

        it("generates bigInteger as BigInt when useBigInt is true", () => {
            const impl = createImpl(createBigIntegerExample("123456789012345678901234567890"), { useBigInt: true });
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toContain("BigInt");
        });

        it("generates base64 string", () => {
            const impl = createImpl(createBase64Example("SGVsbG8="));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"SGVsbG8="');
        });

        it("generates boolean true", () => {
            const impl = createImpl(createBoolExample(true));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("true");
        });

        it("generates boolean false", () => {
            const impl = createImpl(createBoolExample(false));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("false");
        });

        it("generates uuid string", () => {
            const impl = createImpl(createUuidExample("550e8400-e29b-41d4-a716-446655440000"));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"550e8400-e29b-41d4-a716-446655440000"');
        });

        it("generates datetime as new Date()", () => {
            const date = new Date("2024-01-15T12:00:00.000Z");
            const impl = createImpl(createDatetimeExample(date));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toContain("new Date");
            expect(getTextOfTsNode(expr)).toContain("2024-01-15");
        });

        it("generates datetime as string when includeSerdeLayer is false and raw is present", () => {
            const date = new Date("2024-01-15T12:00:00.000Z");
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "2024-01-15T12:00:00Z",
                shape: FernIr.ExampleTypeReferenceShape.primitive(
                    FernIr.ExamplePrimitive.datetime({ datetime: date, raw: "2024-01-15T12:00:00Z" })
                )
            };
            const impl = createImpl(example, { includeSerdeLayer: false });
            const context = createMockBaseContext({ includeSerdeLayer: false });
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"2024-01-15T12:00:00Z"');
        });

        it("generates date string", () => {
            const impl = createImpl(createDateExample("2024-01-15"));
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"2024-01-15"');
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Containers
    // ────────────────────────────────────────────────────────────────────────

    describe("containers", () => {
        it("generates list example", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: ["a", "b"],
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.list({
                        list: [createStringExample("a"), createStringExample("b")],
                        itemType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("generates empty list example", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: [],
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.list({
                        list: [],
                        itemType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("[]");
        });

        it("generates set as Set<> when includeSerdeLayer is true and items are primitive", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: ["a", "b"],
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.set({
                        set: [createStringExample("a"), createStringExample("b")],
                        itemType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example, { includeSerdeLayer: true });
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toContain("new Set");
        });

        it("generates set as Set<> when includeSerdeLayer is true and items are enum (treated as primitive)", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: ["RED", "BLUE"],
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.set({
                        set: [createStringExample("RED"), createStringExample("BLUE")],
                        itemType: FernIr.TypeReference.named({
                            typeId: "type_Color",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("Color"),
                            displayName: undefined,
                            default: undefined,
                            inline: undefined
                        })
                    })
                )
            };
            const impl = createImpl(example, { includeSerdeLayer: true });
            const enumContext = createMockBaseContext();
            // Override resolveTypeReference to return an enum (named + Enum shape)
            enumContext.type.resolveTypeReference = () => ({
                type: "named" as const,
                shape: FernIr.ShapeType.Enum
            });
            const expr = impl.build(enumContext, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toContain("new Set");
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("generates set as array when includeSerdeLayer is true but items are non-primitive", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: ["a", "b"],
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.set({
                        set: [createStringExample("a"), createStringExample("b")],
                        itemType: FernIr.TypeReference.named({
                            typeId: "type_MyObject",
                            fernFilepath: { allParts: [], packagePath: [], file: undefined },
                            name: casingsGenerator.generateName("MyObject"),
                            displayName: undefined,
                            default: undefined,
                            inline: undefined
                        })
                    })
                )
            };
            const impl = createImpl(example, { includeSerdeLayer: true });
            const nonPrimitiveContext = createMockBaseContext();
            // Override resolveTypeReference to return a named (non-primitive) type
            nonPrimitiveContext.type.resolveTypeReference = () => ({
                type: "named" as const,
                shape: FernIr.ShapeType.Object
            });
            const expr = impl.build(nonPrimitiveContext, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).not.toContain("new Set");
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("generates set as array when includeSerdeLayer is false", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: ["a", "b"],
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.set({
                        set: [createStringExample("a"), createStringExample("b")],
                        itemType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example, { includeSerdeLayer: false });
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).not.toContain("new Set");
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("generates map example", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: { key1: "val1" },
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.map({
                        map: [
                            {
                                key: createStringExample("key1"),
                                value: createStringExample("val1")
                            }
                        ],
                        keyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("generates nullable with value", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "hello",
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.nullable({
                        nullable: createStringExample("hello"),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"hello"');
        });

        it("generates nullable with null", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: null,
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.nullable({
                        nullable: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("null");
        });

        it("generates optional with value", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "present",
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.optional({
                        optional: createStringExample("present"),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"present"');
        });

        it("generates optional with undefined", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: undefined,
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.optional({
                        optional: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("undefined");
        });

        it("generates literal example", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "literal_value",
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.literal({
                        literal: FernIr.ExamplePrimitive.string({ original: "literal_value" })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe('"literal_value"');
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Named types
    // ────────────────────────────────────────────────────────────────────────

    describe("named types", () => {
        it("delegates to getGeneratedType().buildExample() for named shapes", () => {
            const typeName: FernIr.DeclaredTypeName = {
                typeId: "type_Color",
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: casingsGenerator.generateName("Color"),
                displayName: undefined
            };
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "RED",
                shape: FernIr.ExampleTypeReferenceShape.named({
                    typeName,
                    shape: FernIr.ExampleTypeReferenceShape.primitive(
                        FernIr.ExamplePrimitive.string({ original: "RED" })
                    )
                    // biome-ignore lint/suspicious/noExplicitAny: test mock — named shape has specific structure
                } as any)
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            // Mock returns "ENUM_VALUE" for all generated type examples
            expect(getTextOfTsNode(expr)).toBe('"ENUM_VALUE"');
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Unknown types
    // ────────────────────────────────────────────────────────────────────────

    describe("unknown types", () => {
        it("generates JSON expression for unknown object", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: { key: "value" },
                shape: FernIr.ExampleTypeReferenceShape.unknown({ key: "value" })
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("generates JSON expression for unknown string", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "just a string",
                shape: FernIr.ExampleTypeReferenceShape.unknown("just a string")
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("generates JSON expression for unknown number", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: 42,
                shape: FernIr.ExampleTypeReferenceShape.unknown(42)
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("42");
        });

        it("generates JSON expression for unknown boolean", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: true,
                shape: FernIr.ExampleTypeReferenceShape.unknown(true)
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toBe("true");
        });

        it("generates JSON expression for unknown array", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: [1, 2, 3],
                shape: FernIr.ExampleTypeReferenceShape.unknown([1, 2, 3])
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Map key property name handling
    // ────────────────────────────────────────────────────────────────────────

    describe("map key property names", () => {
        it("uses numeric property name for integer key", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: { 1: "val" },
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.map({
                        map: [
                            {
                                key: createIntExample(1),
                                value: createStringExample("val")
                            }
                        ],
                        keyType: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("uses string property name for negative integer key", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: { "-1": "val" },
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.map({
                        map: [
                            {
                                key: createIntExample(-1),
                                value: createStringExample("val")
                            }
                        ],
                        keyType: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });

        it("uses boolean identifier for boolean key", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: { true: "val" },
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.map({
                        map: [
                            {
                                key: createBoolExample(true),
                                value: createStringExample("val")
                            }
                        ],
                        keyType: FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined }),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                    })
                )
            };
            const impl = createImpl(example);
            const context = createMockBaseContext();
            const expr = impl.build(context, DEFAULT_OPTS);
            expect(getTextOfTsNode(expr)).toMatchSnapshot();
        });
    });
});
