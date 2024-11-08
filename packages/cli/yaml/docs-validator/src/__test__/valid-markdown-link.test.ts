import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { collectLinksAndSources } from "../rules/valid-markdown-link/collect-links";

describe("getReferencedMarkdownFiles", () => {
    it("should match on .md and .mdx", () => {
        const content = `
        [Link to a markdown file](./file1.md)
        [Link to an mdx file](./file2.mdx)
        `;

        const { links } = collectLinksAndSources({
            content,
            absoluteFilepath: AbsoluteFilePath.of("/path/to/fern/file0.md")
        });

        expect(links.length).toEqual(2);
        expect(links[0]?.href).toEqual("./file1.md");
        expect(links[1]?.href).toEqual("./file2.mdx");
    });

    it("should not match on non-markdown files", () => {
        const content = `
        [Link to a non-markdown file](./file1.txt)
        [Link to a non-markdown file](./file2.js)
        `;

        const { links } = collectLinksAndSources({
            content,
            absoluteFilepath: AbsoluteFilePath.of("/path/to/fern/file0.md")
        });

        expect(links).toEqual([]);
    });

    it("should not match on http or https links", () => {
        const content = `
        [Link to a http file](http://example.com/file1.md)
        [Link to a https file](https://example.com/file2.md)
        `;

        const { links } = collectLinksAndSources({
            content,
            absoluteFilepath: AbsoluteFilePath.of("/path/to/fern/file0.md")
        });

        expect(links).toEqual([]);
    });
});
