import { describe, expect, it } from "vitest";

import { makeNullable } from "../converters/typeConverter.js";

describe("makeNullable", () => {
    it("wraps a $ref in anyOf with a null-typed branch", () => {
        expect(makeNullable({ $ref: "#/components/schemas/Foo" })).toEqual({
            anyOf: [{ $ref: "#/components/schemas/Foo" }, { type: "null" }]
        });
    });

    it("converts a single-string type into a [type, 'null'] array", () => {
        expect(makeNullable({ type: "string" })).toEqual({ type: ["string", "null"] });
    });

    it("preserves other schema fields when making a primitive nullable", () => {
        expect(makeNullable({ type: "string", format: "uuid", description: "An id" })).toEqual({
            type: ["string", "null"],
            format: "uuid",
            description: "An id"
        });
    });

    it("appends 'null' to an existing type array when not already present", () => {
        // The `type` array case isn't representable in OpenAPIV3's TS types, so we build the
        // input loosely and trust `makeNullable`'s runtime handling.
        const input = { type: ["string", "integer"] } as unknown as Parameters<typeof makeNullable>[0];
        expect(makeNullable(input)).toEqual({ type: ["string", "integer", "null"] });
    });

    it("is a no-op when 'null' is already in the type array", () => {
        const input = { type: ["string", "null"] } as unknown as Parameters<typeof makeNullable>[0];
        expect(makeNullable(input)).toEqual({ type: ["string", "null"] });
    });

    it("leaves an empty schema untouched (unconstrained schema already admits null)", () => {
        expect(makeNullable({})).toEqual({});
    });
});
