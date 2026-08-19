import { FernIr } from "@fern-fern/ir-sdk";

import { DefaultValueExtractor } from "../DefaultValueExtractor.js";
import type { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Creates a FernIr.TypeReference.Primitive with a v2 primitive type.
 */
function makePrimitiveTypeRef(v2: FernIr.PrimitiveTypeV2): FernIr.TypeReference {
    return FernIr.TypeReference.primitive({
        v1: FernIr.PrimitiveTypeV1.String, // v1 is not used by DefaultValueExtractor
        v2
    });
}

/**
 * Wraps a type reference in an optional container.
 */
function makeOptional(inner: FernIr.TypeReference): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.optional(inner));
}

/**
 * Wraps a type reference in a nullable container.
 */
function makeNullable(inner: FernIr.TypeReference): FernIr.TypeReference {
    return FernIr.TypeReference.container(FernIr.ContainerType.nullable(inner));
}

describe("DefaultValueExtractor", () => {
    // DefaultValueExtractor only uses context for named types (alias resolution).
    // For primitive and container types, context is not accessed.
    const extractor = new DefaultValueExtractor({} as unknown as SdkGeneratorContext);

    describe("bigInteger defaults", () => {
        it("should return string literal for bigInteger with default", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.bigInteger({
                    default: "18446744073709551615"
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: '"18446744073709551615"',
                csharpType: "string",
                isConst: true
            });
        });

        it("should return undefined for bigInteger without default", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.bigInteger({
                    default: undefined
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toBeUndefined();
        });
    });

    describe("integer defaults", () => {
        it("should return int value for integer with default", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.integer({
                    default: 42,
                    validation: undefined
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: "42",
                csharpType: "int",
                isConst: true
            });
        });

        it("should return undefined for integer without default", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.integer({
                    default: undefined,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });
    });

    describe("long defaults", () => {
        it("should return long value with L suffix for safe integers", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.long({
                    default: 100,
                    validation: undefined
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: "100L",
                csharpType: "long",
                isConst: true
            });
        });

        it("should return undefined for unsafe large integers", () => {
            // Number.MAX_SAFE_INTEGER + 1 is not safe
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.long({
                    default: Number.MAX_SAFE_INTEGER + 1,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });

        it("should return undefined for long without default", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.long({
                    default: undefined,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });
    });

    describe("double defaults", () => {
        it("should format double with decimal point", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.double({
                    default: 5,
                    validation: undefined
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: "5.0",
                csharpType: "double",
                isConst: true
            });
        });

        it("should preserve existing decimal point", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.double({
                    default: 3.14,
                    validation: undefined
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: "3.14",
                csharpType: "double",
                isConst: true
            });
        });
    });

    describe("boolean defaults", () => {
        it("should return 'true' for true default", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.boolean({
                    default: true
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: "true",
                csharpType: "bool",
                isConst: true
            });
        });

        it("should return 'false' for false default", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.boolean({
                    default: false
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: "false",
                csharpType: "bool",
                isConst: true
            });
        });
    });

    describe("string defaults", () => {
        it("should escape and quote string defaults", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.string({
                    default: "hello",
                    validation: undefined
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: '"hello"',
                csharpType: "string",
                isConst: true
            });
        });

        it("should escape special characters", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.string({
                    default: 'line1\nline2\t"quoted"',
                    validation: undefined
                })
            );
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: '"line1\\nline2\\t\\"quoted\\""',
                csharpType: "string",
                isConst: true
            });
        });
    });

    describe("types without default support", () => {
        it("should return undefined for dateTimeRfc2822", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.dateTimeRfc2822({
                    default: undefined,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });

        it("should return undefined for date", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.date({
                    default: undefined,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });

        it("should return undefined for dateTime", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.dateTime({
                    default: undefined,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });

        it("should return undefined for uuid", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.uuid({
                    default: undefined,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });

        it("should return undefined for float", () => {
            const typeRef = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.float({
                    default: undefined,
                    validation: undefined
                })
            );
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });
    });

    describe("container unwrapping", () => {
        it("should unwrap optional to find inner default", () => {
            const inner = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.integer({
                    default: 10,
                    validation: undefined
                })
            );
            const typeRef = makeOptional(inner);
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: "10",
                csharpType: "int",
                isConst: true
            });
        });

        it("should unwrap nullable to find inner default", () => {
            const inner = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.string({
                    default: "test",
                    validation: undefined
                })
            );
            const typeRef = makeNullable(inner);
            const result = extractor.extractDefault(typeRef);
            expect(result).toEqual({
                value: '"test"',
                csharpType: "string",
                isConst: true
            });
        });

        it("should return undefined for list container", () => {
            const inner = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.integer({
                    default: 42,
                    validation: undefined
                })
            );
            const typeRef = FernIr.TypeReference.container(FernIr.ContainerType.list(inner));
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });

        it("should return undefined for map container", () => {
            const keyType = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.string({ default: undefined, validation: undefined })
            );
            const valueType = makePrimitiveTypeRef(
                FernIr.PrimitiveTypeV2.string({ default: undefined, validation: undefined })
            );
            const typeRef = FernIr.TypeReference.container(FernIr.ContainerType.map({ keyType, valueType }));
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });
    });

    describe("unknown type reference", () => {
        it("should return undefined for unknown type", () => {
            const typeRef = FernIr.TypeReference.unknown();
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });
    });

    describe("primitive without v2", () => {
        it("should return undefined when v2 is null", () => {
            const typeRef = FernIr.TypeReference.primitive({
                v1: FernIr.PrimitiveTypeV1.String,
                v2: undefined
            });
            expect(extractor.extractDefault(typeRef)).toBeUndefined();
        });
    });
});
