import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { collectLinksAndSources } from "./collect-links";

describe("collectLinksAndSources", () => {
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

    it("should trace imports to other markdown files", () => {
        const content = "import Component from \"./file1.mdx\";";

        const { links } = collectLinksAndSources({
            content,
            absoluteFilepath: AbsoluteFilePath.of("/path/to/fern/file0.mdx"),
            readFile: (path) => {
                if (path === AbsoluteFilePath.of("/path/to/fern/file1.mdx")) {
                    return "[Link to a markdown file](./file2.mdx)";
                }
                throw new Error(`File not found: ${path}`);
            }
        });

        expect(links.length).toEqual(1);
        expect(links[0]?.href).toEqual("./file2.mdx");
    });

    it("should throw if there is a circular import", () => {
        const content = "import Component from \"./file1.mdx\";";

        expect(() => {
            collectLinksAndSources({
                content,
                absoluteFilepath: AbsoluteFilePath.of("/path/to/fern/file0.mdx"),
                readFile: () => content
            });
        }).toThrow("Circular import detected: /path/to/fern/file1.mdx");
    });

    it("should trace relative paths correctly", () => {
        const content = "import Component from \"file1.mdx\";";

        const { links } = collectLinksAndSources({
            content,
            absoluteFilepath: AbsoluteFilePath.of("/path/to/fern/file0.mdx"),
            readFile: (path) => {
                if (path === AbsoluteFilePath.of("/path/to/fern/file1.mdx")) {
                    return "import Component from \"../file2.mdx\";\n\n[Link to a markdown file](./page-2)";
                } else if (path === AbsoluteFilePath.of("/path/to/file2.mdx")) {
                    return "import Component from \"./../other/file3.mdx\";\n\n[Link to a markdown file](./page-3)";
                } else if (path === AbsoluteFilePath.of("/path/other/file3.mdx")) {
                    return "[Link to a markdown file](./page-4)";
                }
                throw new Error(`File not found: ${path}`);
            }
        });

        const hrefs = links.map((link) => link.href);
        expect(hrefs).toContain("./page-2");
        expect(hrefs).toContain("./page-3");
        expect(hrefs).toContain("./page-4");
    });
});
