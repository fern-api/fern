import { removeUndefinedProperties } from "../removeUndefinedProperties.js";

describe("removeUndefinedProperties", () => {
    it("drops undefined properties and keeps everything else", () => {
        const result = removeUndefinedProperties({ a: 1, b: undefined, c: null, d: "", e: false, f: 0 });
        expect(result).toEqual({ a: 1, c: null, d: "", e: false, f: 0 });
        expect(Object.keys(result)).toEqual(["a", "c", "d", "e", "f"]);
    });

    it("does not modify the input", () => {
        const input = { a: undefined, b: 1 };
        removeUndefinedProperties(input);
        expect(Object.keys(input)).toEqual(["a", "b"]);
    });
});
