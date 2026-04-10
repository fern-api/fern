import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { resolve } from "../resolve.js";

describe("join", () => {
    it("simple", async () => {
        const dir = AbsoluteFilePath.of("/path/to/fern");
        const resolvedPath = resolve(dir, "../introduction/responses.md");
        expect(resolvedPath).toEqual(AbsoluteFilePath.of("/path/to/introduction/responses.md"));
    });
});
