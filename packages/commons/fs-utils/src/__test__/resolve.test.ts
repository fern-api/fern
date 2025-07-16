import { AbsoluteFilePath } from "../AbsoluteFilePath"
import { resolve } from "../resolve"

describe("join", () => {
    it("simple", async () => {
        const dir = AbsoluteFilePath.of("/path/to/fern")
        const resolvedPath = resolve(dir, "../introduction/responses.md")
        expect(resolvedPath).toEqual(AbsoluteFilePath.of("/path/to/introduction/responses.md"))
    })
})
