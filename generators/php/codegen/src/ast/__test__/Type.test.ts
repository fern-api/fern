import { describe, expect, it } from "vitest";

import { Writer } from "../core/Writer.js";
import { Type } from "../Type.js";

function render(type: Type, { comment = false }: { comment?: boolean } = {}): string {
    const writer = new Writer({ namespace: "Seed", rootNamespace: "Seed", customConfig: {} });
    type.write(writer, { comment });
    return writer.toString(true).trim();
}

describe("Type", () => {
    describe("optional union", () => {
        it("appends null to a union without mixed", () => {
            expect(render(Type.optional(Type.union([Type.string(), Type.int()])))).toBe("string|int|null");
        });

        it("renders a union containing mixed as bare mixed", () => {
            expect(render(Type.optional(Type.union([Type.mixed()])))).toBe("mixed");
            expect(render(Type.optional(Type.union([Type.string(), Type.mixed()])))).toBe("mixed");
        });

        it("does not append null to a union containing mixed in docblocks", () => {
            expect(render(Type.optional(Type.union([Type.mixed()])), { comment: true })).not.toContain("null");
        });

        it("appends null to a union without mixed in docblocks", () => {
            expect(render(Type.optional(Type.union([Type.string(), Type.int()])), { comment: true })).toMatch(
                /\)\|null$/
            );
        });
    });
});
