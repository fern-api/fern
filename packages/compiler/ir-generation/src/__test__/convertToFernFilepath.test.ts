import { convertToFernFilepath } from "../utils/convertToFernFilepath";

describe("convertToFernFilepath", () => {
    it('""', () => {
        expect(convertToFernFilepath("")).toEqual([]);
    });

    it("a", () => {
        expect(convertToFernFilepath("a")).toEqual([]);
    });

    it("a/b/c", () => {
        expect(convertToFernFilepath("a/b/c")).toEqual(["a", "b"]);
    });
});
