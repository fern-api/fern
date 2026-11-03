import { describe, expect, it } from "vitest";
import { Writer } from "../ast/core/Writer.js";
import { Type } from "../ast/Type.js";

function write(type: Type, comment = false): string {
    const writer = new Writer({
        namespace: "Seed",
        rootNamespace: "Seed",
        customConfig: {}
    });
    type.write(writer, { comment });
    return writer.toString(true);
}

describe("Type", () => {
    it("writes an optional union containing mixed as plain mixed", () => {
        expect(write(Type.optional(Type.union([Type.mixed(), Type.string()])))).toBe("mixed");
    });

    it("writes an optional mixed as plain mixed", () => {
        expect(write(Type.optional(Type.mixed()))).toBe("mixed");
    });

    it("adds null to an optional union without mixed", () => {
        expect(write(Type.optional(Type.union([Type.string(), Type.int()])))).toBe("string|int|null");
    });

    it("keeps null in the docblock for an optional union containing mixed", () => {
        expect(write(Type.optional(Type.union([Type.mixed(), Type.string()])), true)).toContain("null");
    });
});
