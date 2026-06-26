import { describe, expect, it } from "vitest";

import { getHeaderValueStringLiteral } from "../test-generator/TestGenerator.js";

describe("getHeaderValueStringLiteral", () => {
    it("emits a plain value as a valid double-quoted string literal", () => {
        expect(getHeaderValueStringLiteral("application/json")).toBe('"application/json"');
    });

    it("escapes embedded double quotes so the literal does not terminate early", () => {
        const literal = getHeaderValueStringLiteral('endpoint"value');
        expect(literal).toBe('"endpoint\\"value"');
        expect(JSON.parse(literal)).toBe('endpoint"value');
    });

    it("keeps backticks contained so oxc does not read them as a template literal", () => {
        const literal = getHeaderValueStringLiteral("eyJpZCI6ImFuX2lkIiwidiI6MX0`");
        expect(literal).toBe('"eyJpZCI6ImFuX2lkIiwidiI6MX0`"');
        expect(JSON.parse(literal)).toBe("eyJpZCI6ImFuX2lkIiwidiI6MX0`");
    });

    it("escapes backslashes and newlines", () => {
        const literal = getHeaderValueStringLiteral("line1\nline2\\end");
        expect(JSON.parse(literal)).toBe("line1\nline2\\end");
    });

    it("does not interpret template-literal interpolation syntax", () => {
        const literal = getHeaderValueStringLiteral("${process.env.SECRET}");
        expect(JSON.parse(literal)).toBe("${process.env.SECRET}");
    });

    it("coerces non-string examples to strings", () => {
        expect(getHeaderValueStringLiteral(123)).toBe('"123"');
        expect(getHeaderValueStringLiteral(true)).toBe('"true"');
    });
});
