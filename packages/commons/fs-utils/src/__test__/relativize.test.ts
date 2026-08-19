import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { RelativeFilePath } from "../RelativeFilePath.js";
import { relativize } from "../relativize.js";

describe("join", () => {
    it("simple", async () => {
        const from = AbsoluteFilePath.of("/path/to/fern");
        const to = AbsoluteFilePath.of("/path/to/fern/docs/markdown.md");
        const path = relativize(from, to);
        expect(path).toEqual(RelativeFilePath.of("docs/markdown.md"));
    });
});
