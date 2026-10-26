import { isRecord } from "../objects/isRecord.js";

describe("isRecord", () => {
    it("accepts plain objects and class instances", () => {
        expect(isRecord({})).toBe(true);
        expect(isRecord({ a: 1 })).toBe(true);
        expect(isRecord(Object.create(null))).toBe(true);
        expect(isRecord(new (class Foo {})())).toBe(true);
    });

    it("rejects arrays, null and primitives", () => {
        expect(isRecord([])).toBe(false);
        expect(isRecord(null)).toBe(false);
        expect(isRecord(undefined)).toBe(false);
        expect(isRecord("a")).toBe(false);
        expect(isRecord(1)).toBe(false);
    });
});
