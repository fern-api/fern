import { convertToFernFilepath } from "../utils/convertToFernFilepath";

describe("convertToFernFilepath", () => {
    it('""', () => {
        expect(convertToFernFilepath("posts.yml")).toEqual(["posts"]);
    });

    it("a", () => {
        expect(convertToFernFilepath("a/b.yml")).toEqual(["a", "b"]);
    });

    it("a/b/c", () => {
        expect(convertToFernFilepath("a/b/c.yml")).toEqual(["a", "b", "c"]);
    });
});
