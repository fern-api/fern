import { describe, expect, it } from "vitest";
import { toRubyStringLiteral } from "../WireTestGenerator.js";

describe("toRubyStringLiteral", () => {
    it("uses double quotes when the value has no double quote", () => {
        expect(toRubyStringLiteral("1")).toBe('"1"');
        expect(toRubyStringLiteral("true")).toBe('"true"');
    });

    it("uses single quotes and escapes backslashes and single quotes when the value has a double quote", () => {
        expect(toRubyStringLiteral('["it\'s","a\\\\b"]')).toBe('\'["it\\\'s","a\\\\\\\\b"]\'');
    });

    it("escapes interpolation markers inside double quotes", () => {
        expect(toRubyStringLiteral("#{x} #@y #$z # plain")).toBe('"\\#{x} \\#@y \\#$z # plain"');
    });
});
