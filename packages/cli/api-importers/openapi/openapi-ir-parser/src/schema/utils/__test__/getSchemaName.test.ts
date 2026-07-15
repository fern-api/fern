import { describe, expect, it } from "vitest";

import { getGeneratedTypeName } from "../getSchemaName.js";

describe("getGeneratedTypeName", () => {
    it("generates a PascalCase name from breadcrumbs", () => {
        expect(getGeneratedTypeName(["workbook", "spec"], false)).toBe("WorkbookSpec");
    });

    it("preserves purely non-alphanumeric tokens", () => {
        expect(getGeneratedTypeName(["_"], false)).toBe("_");
    });

    it("caps pathologically long tokens to a bounded name", () => {
        const longToken = "a".repeat(200_000);
        const name = getGeneratedTypeName([longToken], false);

        expect(name.length).toBeLessThan(1024);
    });

    it("produces deterministic and distinct names for distinct long tokens", () => {
        const a = `${"x".repeat(600)}A`;
        const b = `${"x".repeat(600)}B`;

        expect(getGeneratedTypeName([a], false)).toBe(getGeneratedTypeName([a], false));
        expect(getGeneratedTypeName([a], false)).not.toBe(getGeneratedTypeName([b], false));
    });
});
