import { FernIr } from "@fern-fern/ir-sdk";
import { createNameAndWireValue } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";
import { getLiteralValueForHeader, isLiteralHeader } from "../endpoints/utils/isLiteralHeader.js";

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(resolvedType?: FernIr.ResolvedTypeReference): any {
    return {
        type: {
            resolveTypeReference: () =>
                resolvedType ??
                FernIr.ResolvedTypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.String,
                    v2: undefined
                })
        }
    };
}

function createHeader(valueType?: FernIr.TypeReference): FernIr.HttpHeader {
    return {
        name: createNameAndWireValue("X-Custom-Header"),
        valueType: valueType ?? FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        env: undefined,
        availability: undefined,
        docs: undefined,
        v2Examples: undefined,
        clientDefault: undefined
    };
}

describe("isLiteralHeader", () => {
    it("returns false for non-literal string type", () => {
        const header = createHeader();
        const context = createMockContext(
            FernIr.ResolvedTypeReference.primitive({
                v1: FernIr.PrimitiveTypeV1.String,
                v2: undefined
            })
        );
        expect(isLiteralHeader(header, context)).toBe(false);
    });

    it("returns true for literal string type", () => {
        const header = createHeader();
        const context = createMockContext(
            FernIr.ResolvedTypeReference.container(
                FernIr.ContainerType.literal(FernIr.Literal.string("application/json"))
            )
        );
        expect(isLiteralHeader(header, context)).toBe(true);
    });

    it("returns true for literal boolean type", () => {
        const header = createHeader();
        const context = createMockContext(
            FernIr.ResolvedTypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.boolean(true)))
        );
        expect(isLiteralHeader(header, context)).toBe(true);
    });
});

describe("getLiteralValueForHeader", () => {
    it("returns undefined for non-literal type", () => {
        const header = createHeader();
        const context = createMockContext(
            FernIr.ResolvedTypeReference.primitive({
                v1: FernIr.PrimitiveTypeV1.String,
                v2: undefined
            })
        );
        expect(getLiteralValueForHeader(header, context)).toBeUndefined();
    });

    it("returns string value for literal string type", () => {
        const header = createHeader();
        const context = createMockContext(
            FernIr.ResolvedTypeReference.container(
                FernIr.ContainerType.literal(FernIr.Literal.string("application/json"))
            )
        );
        expect(getLiteralValueForHeader(header, context)).toBe("application/json");
    });

    it("returns boolean value for literal boolean type (true)", () => {
        const header = createHeader();
        const context = createMockContext(
            FernIr.ResolvedTypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.boolean(true)))
        );
        expect(getLiteralValueForHeader(header, context)).toBe(true);
    });

    it("returns boolean value for literal boolean type (false)", () => {
        const header = createHeader();
        const context = createMockContext(
            FernIr.ResolvedTypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.boolean(false)))
        );
        expect(getLiteralValueForHeader(header, context)).toBe(false);
    });
});
