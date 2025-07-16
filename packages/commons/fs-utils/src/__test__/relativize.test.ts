import { AbsoluteFilePath } from "../AbsoluteFilePath"
import { RelativeFilePath } from "../RelativeFilePath"
import { relativize } from "../relativize"

describe("join", () => {
    it("simple", async () => {
        const from = AbsoluteFilePath.of("/path/to/fern")
        const to = AbsoluteFilePath.of("/path/to/fern/docs/markdown.md")
        const path = relativize(from, to)
        expect(path).toEqual(RelativeFilePath.of("docs/markdown.md"))
    })
})
