import { FernIr } from "@fern-fern/ir-sdk";

import { convertExampleTypeReferenceToTypeReference } from "../convertExampleTypeReferenceToTypeReference.js";

/**
 * Helper to create an ExampleTypeReference with a primitive shape.
 */
function makePrimitiveExample(primitive: FernIr.ExamplePrimitive): FernIr.ExampleTypeReference {
    return {
        jsonExample: undefined,
        shape: FernIr.ExampleTypeReferenceShape.primitive(primitive)
    };
}

describe("convertExampleTypeReferenceToTypeReference", () => {
    describe("primitive conversions", () => {
        it("should convert string example to string type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.string({ original: "hello" }));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.String);
                expect(result.primitive.v2?.type).toBe("string");
            }
        });

        it("should convert integer example to integer type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.integer(42));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Integer);
                expect(result.primitive.v2?.type).toBe("integer");
            }
        });

        it("should convert boolean example to boolean type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.boolean(true));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Boolean);
                expect(result.primitive.v2?.type).toBe("boolean");
            }
        });

        it("should convert long example to long type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.long(123456789));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Long);
                expect(result.primitive.v2?.type).toBe("long");
            }
        });

        it("should convert double example to double type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.double(3.14));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Double);
                expect(result.primitive.v2?.type).toBe("double");
            }
        });

        it("should convert bigInteger example to bigInteger type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.bigInteger("18446744073709551615"));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.BigInteger);
                expect(result.primitive.v2?.type).toBe("bigInteger");
            }
        });

        it("should convert datetimeRfc2822 example to DateTimeRfc2822 type reference", () => {
            const example = makePrimitiveExample(
                FernIr.ExamplePrimitive.datetimeRfc2822({
                    datetime: new Date("2026-03-07T12:00:00Z"),
                    raw: "Sat, 07 Mar 2026 12:00:00 +0000"
                })
            );
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.DateTimeRfc2822);
                expect(result.primitive.v2?.type).toBe("dateTimeRfc2822");
            }
        });

        it("should convert date example to date type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.date("2026-03-07"));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Date);
                expect(result.primitive.v2?.type).toBe("date");
            }
        });

        it("should convert datetime example to datetime type reference", () => {
            const example = makePrimitiveExample(
                FernIr.ExamplePrimitive.datetime({
                    datetime: new Date("2026-03-07T12:00:00Z"),
                    raw: undefined
                })
            );
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.DateTime);
                expect(result.primitive.v2?.type).toBe("dateTime");
            }
        });

        it("should convert uuid example to uuid type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.uuid("550e8400-e29b-41d4-a716-446655440000"));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Uuid);
                expect(result.primitive.v2?.type).toBe("uuid");
            }
        });

        it("should convert base64 example to base64 type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.base64("SGVsbG8gV29ybGQ="));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Base64);
                expect(result.primitive.v2?.type).toBe("base64");
            }
        });

        it("should convert float example to float type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.float(1.5));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Float);
                expect(result.primitive.v2?.type).toBe("float");
            }
        });

        it("should convert uint example to uint type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.uint(42));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Uint);
                expect(result.primitive.v2?.type).toBe("uint");
            }
        });

        it("should convert uint64 example to uint64 type reference", () => {
            const example = makePrimitiveExample(FernIr.ExamplePrimitive.uint64(42));
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("primitive");
            if (result.type === "primitive") {
                expect(result.primitive.v1).toBe(FernIr.PrimitiveTypeV1.Uint64);
                expect(result.primitive.v2?.type).toBe("uint64");
            }
        });
    });

    describe("unknown type", () => {
        it("should convert unknown example to unknown type reference", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: { key: "value" },
                shape: FernIr.ExampleTypeReferenceShape.unknown({ key: "value" })
            };
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("unknown");
        });
    });

    describe("container types", () => {
        it("should convert optional container", () => {
            const stringTypeRef = FernIr.TypeReference.primitive({
                v1: FernIr.PrimitiveTypeV1.String,
                v2: FernIr.PrimitiveTypeV2.string({ default: undefined, validation: undefined })
            });
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "test",
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.optional({
                        optional: {
                            jsonExample: "test",
                            shape: FernIr.ExampleTypeReferenceShape.primitive(
                                FernIr.ExamplePrimitive.string({ original: "test" })
                            )
                        },
                        valueType: stringTypeRef
                    })
                )
            };
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("container");
            if (result.type === "container") {
                expect(result.container.type).toBe("optional");
            }
        });

        it("should convert list container", () => {
            const stringTypeRef = FernIr.TypeReference.primitive({
                v1: FernIr.PrimitiveTypeV1.String,
                v2: FernIr.PrimitiveTypeV2.string({ default: undefined, validation: undefined })
            });
            const example: FernIr.ExampleTypeReference = {
                jsonExample: ["a", "b"],
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.list({
                        list: [],
                        itemType: stringTypeRef
                    })
                )
            };
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("container");
            if (result.type === "container") {
                expect(result.container.type).toBe("list");
            }
        });
    });

    describe("literal containers", () => {
        it("should convert string literal", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "hello",
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.literal({
                        literal: FernIr.ExamplePrimitive.string({ original: "hello" })
                    })
                )
            };
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("container");
            if (result.type === "container") {
                expect(result.container.type).toBe("literal");
            }
        });

        it("should convert boolean literal", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: true,
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.literal({
                        literal: FernIr.ExamplePrimitive.boolean(true)
                    })
                )
            };
            const result = convertExampleTypeReferenceToTypeReference(example);
            expect(result.type).toBe("container");
            if (result.type === "container") {
                expect(result.container.type).toBe("literal");
            }
        });

        it("should throw for unsupported literal types like datetimeRfc2822", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "Sat, 07 Mar 2026 12:00:00 +0000",
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.literal({
                        literal: FernIr.ExamplePrimitive.datetimeRfc2822({
                            datetime: new Date("2026-03-07T12:00:00Z"),
                            raw: "Sat, 07 Mar 2026 12:00:00 +0000"
                        })
                    })
                )
            };
            expect(() => convertExampleTypeReferenceToTypeReference(example)).toThrow(
                "Internal error; only boolean and string literals are permitted"
            );
        });

        it("should throw for bigInteger literal", () => {
            const example: FernIr.ExampleTypeReference = {
                jsonExample: "999",
                shape: FernIr.ExampleTypeReferenceShape.container(
                    FernIr.ExampleContainer.literal({
                        literal: FernIr.ExamplePrimitive.bigInteger("999")
                    })
                )
            };
            expect(() => convertExampleTypeReferenceToTypeReference(example)).toThrow(
                "Internal error; only boolean and string literals are permitted"
            );
        });
    });
});
