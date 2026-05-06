import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { buildJsonFromExampleTypeReference } from "../buildJsonFromExampleTypeReference.js";

const STRING_TYPE_REFERENCE = FernIr.TypeReference.primitive({
    v1: FernIr.PrimitiveTypeV1.String,
    v2: undefined
});

function refContainer(container: FernIr.ExampleContainer, jsonExample: unknown): FernIr.ExampleTypeReference {
    return {
        jsonExample,
        shape: FernIr.ExampleTypeReferenceShape.container(container)
    };
}

function refPrimitive(primitive: FernIr.ExamplePrimitive, jsonExample: unknown): FernIr.ExampleTypeReference {
    return {
        jsonExample,
        shape: FernIr.ExampleTypeReferenceShape.primitive(primitive)
    };
}

describe("buildJsonFromExampleTypeReference", () => {
    it("returns the primitive value for a string example", () => {
        const ref = refPrimitive(FernIr.ExamplePrimitive.string({ original: "hello" }), "hello");
        expect(buildJsonFromExampleTypeReference(ref)).toBe("hello");
    });

    it("returns null for a nullable example whose inner value is unset", () => {
        const ref = refContainer(
            FernIr.ExampleContainer.nullable({
                nullable: undefined,
                valueType: STRING_TYPE_REFERENCE
            }),
            undefined
        );
        expect(buildJsonFromExampleTypeReference(ref)).toBeNull();
    });

    it("recurses into a populated nullable example", () => {
        const inner = refPrimitive(FernIr.ExamplePrimitive.string({ original: "value" }), "value");
        const ref = refContainer(
            FernIr.ExampleContainer.nullable({
                nullable: inner,
                valueType: STRING_TYPE_REFERENCE
            }),
            "value"
        );
        expect(buildJsonFromExampleTypeReference(ref)).toBe("value");
    });

    it("returns undefined for an optional example whose inner value is unset (so JSON.stringify omits the key)", () => {
        const ref = refContainer(
            FernIr.ExampleContainer.optional({
                optional: undefined,
                valueType: STRING_TYPE_REFERENCE
            }),
            undefined
        );
        expect(buildJsonFromExampleTypeReference(ref)).toBeUndefined();
    });

    // Regression test for the wire-test mismatch surfaced by Square's CalculateOrder
    // example. The IR's `jsonExample` for a map<string, nullable<string>> with an
    // explicit-null entry was produced via `Object.entries`/recursion in a way that
    // left the value as JS `undefined` (because the inner nullable's `jsonExample`
    // is `undefined`). `JSON.stringify` then dropped that key entirely, while the
    // Swift `Nullable.null` expected struct retained it — causing dict-equality
    // failures at runtime.
    it("preserves map entries whose value is an explicit-null nullable<T>", () => {
        const nullableNullValue = refContainer(
            FernIr.ExampleContainer.nullable({
                nullable: undefined,
                valueType: STRING_TYPE_REFERENCE
            }),
            undefined
        );
        const mapRef = refContainer(
            FernIr.ExampleContainer.map({
                map: [
                    {
                        key: refPrimitive(FernIr.ExamplePrimitive.string({ original: "metadata" }), "metadata"),
                        value: nullableNullValue
                    }
                ],
                keyType: STRING_TYPE_REFERENCE,
                valueType: STRING_TYPE_REFERENCE
            }),
            // Simulates the IR-supplied jsonExample, which has lost the entry.
            { metadata: undefined }
        );

        const result = buildJsonFromExampleTypeReference(mapRef);

        expect(result).toEqual({ metadata: null });
        // After serialization, the entry survives — this is the key fix.
        expect(JSON.stringify(result)).toBe('{"metadata":null}');
    });

    it("renders a nested object with a nullable map property correctly", () => {
        const nullableNullValue = refContainer(
            FernIr.ExampleContainer.nullable({
                nullable: undefined,
                valueType: STRING_TYPE_REFERENCE
            }),
            undefined
        );
        const mapRef = refContainer(
            FernIr.ExampleContainer.map({
                map: [
                    {
                        key: refPrimitive(FernIr.ExamplePrimitive.string({ original: "metadata" }), "metadata"),
                        value: nullableNullValue
                    }
                ],
                keyType: STRING_TYPE_REFERENCE,
                valueType: STRING_TYPE_REFERENCE
            }),
            { metadata: undefined }
        );
        const objectRef: FernIr.ExampleTypeReference = {
            jsonExample: { metadata: { metadata: undefined } },
            shape: FernIr.ExampleTypeReferenceShape.named({
                typeName: {
                    typeId: "type_orders:Order",
                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                    name: {
                        originalName: "Order",
                        camelCase: { unsafeName: "order", safeName: "order" },
                        snakeCase: { unsafeName: "order", safeName: "order" },
                        screamingSnakeCase: { unsafeName: "ORDER", safeName: "ORDER" },
                        pascalCase: { unsafeName: "Order", safeName: "Order" }
                    },
                    displayName: undefined
                },
                shape: FernIr.ExampleTypeShape.object({
                    properties: [
                        {
                            name: "metadata",
                            value: mapRef,
                            propertyAccess: undefined,
                            originalTypeDeclaration: {
                                typeId: "type_orders:Order",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: {
                                    originalName: "Order",
                                    camelCase: { unsafeName: "order", safeName: "order" },
                                    snakeCase: { unsafeName: "order", safeName: "order" },
                                    screamingSnakeCase: { unsafeName: "ORDER", safeName: "ORDER" },
                                    pascalCase: { unsafeName: "Order", safeName: "Order" }
                                },
                                displayName: undefined
                            }
                        }
                    ],
                    extraProperties: undefined
                })
            })
        };

        const result = buildJsonFromExampleTypeReference(objectRef);
        expect(result).toEqual({ metadata: { metadata: null } });
        expect(JSON.stringify(result)).toBe('{"metadata":{"metadata":null}}');
    });

    it("preserves explicit null values inside lists of nullable<T>", () => {
        const listRef = refContainer(
            FernIr.ExampleContainer.list({
                list: [
                    refContainer(
                        FernIr.ExampleContainer.nullable({
                            nullable: undefined,
                            valueType: STRING_TYPE_REFERENCE
                        }),
                        undefined
                    ),
                    refContainer(
                        FernIr.ExampleContainer.nullable({
                            nullable: refPrimitive(FernIr.ExamplePrimitive.string({ original: "x" }), "x"),
                            valueType: STRING_TYPE_REFERENCE
                        }),
                        "x"
                    )
                ],
                itemType: STRING_TYPE_REFERENCE
            }),
            [undefined, "x"]
        );

        const result = buildJsonFromExampleTypeReference(listRef);
        expect(result).toEqual([null, "x"]);
        expect(JSON.stringify(result)).toBe('[null,"x"]');
    });

    /**
     * Mirrors `WireTestFunctionGenerator.generateDateTimeLiteral` so these tests
     * can verify that the JSON body and expected Swift struct use the same date
     * string representation.
     */
    function expectedStructDateString(raw: string): string {
        const timestampSec = Math.round(new Date(raw).getTime() / 1000);
        return new Date(timestampSec * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
    }

    describe("datetime", () => {
        it("matches the expected-struct date string when raw has fractional seconds", () => {
            const raw = "2024-01-01T00:00:00.123Z";
            const ref = refPrimitive(
                FernIr.ExamplePrimitive.datetime({
                    datetime: new Date(raw),
                    raw
                }),
                raw
            );
            expect(buildJsonFromExampleTypeReference(ref)).toBe(expectedStructDateString(raw));
        });

        // Matches the expected-struct generator emitting `nop()` (no argument)
        // for the same input — `JSON.stringify` will drop the resulting key.
        it("returns undefined when raw is absent", () => {
            const ref = refPrimitive(
                FernIr.ExamplePrimitive.datetime({
                    datetime: new Date("2024-01-01T00:00:00Z"),
                    raw: undefined
                }),
                undefined
            );
            expect(buildJsonFromExampleTypeReference(ref)).toBeUndefined();
        });
    });

    describe("datetimeRfc2822", () => {
        // Swift's runtime `JSONDecoder` (see `generators/swift/base/src/asIs/Sources/Serde.swift`)
        // only parses ISO 8601 — never RFC 2822 — so the body must be ISO 8601
        // even for `datetimeRfc2822` fields.
        it("matches the expected-struct date string when raw is RFC 2822", () => {
            const raw = "Mon, 01 Jan 2024 00:00:00 GMT";
            const ref = refPrimitive(
                FernIr.ExamplePrimitive.datetimeRfc2822({
                    datetime: new Date(raw),
                    raw
                }),
                raw
            );
            expect(buildJsonFromExampleTypeReference(ref)).toBe(expectedStructDateString(raw));
        });

        it("returns undefined when raw is absent", () => {
            const ref = refPrimitive(
                FernIr.ExamplePrimitive.datetimeRfc2822({
                    datetime: new Date("2024-01-01T00:00:00Z"),
                    raw: undefined
                }),
                undefined
            );
            expect(buildJsonFromExampleTypeReference(ref)).toBeUndefined();
        });
    });
});
