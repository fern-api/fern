import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { diffLines } from "diff";
import fs from "fs";
import { resolve } from "path";
import { parseImagePaths, replaceImagePaths } from "../parseImagePaths";

const MDX_PATH = RelativeFilePath.of("my/docs/folder/file.mdx");

describe("parseImagePaths", () => {
    it("should return an empty array if there are no images", () => {
        const page = "This is a test page";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot('"This is a test page"');
    });

    it("should return an array of image paths", () => {
        const page = "This is a test page with an image ![image](path/to/image.png)";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](my/docs/folder/path/to/image.png)"'
        );
    });

    it("should return an array of image paths with multiple images", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image1.png) and another image ![image2](path/to/image2.png)";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image1.png", "my/docs/folder/path/to/image2.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image1](my/docs/folder/path/to/image1.png) and another image ![image2](my/docs/folder/path/to/image2.png)"'
        );
    });

    it("should return an array of image paths with multiple images of the same path", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image.png) and another image ![image2](path/to/image.png)";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image1](my/docs/folder/path/to/image.png) and another image ![image2](my/docs/folder/path/to/image.png)"'
        );
    });

    it("should return an array of image paths from html image tags", () => {
        const page = "This is a test page with an image <img src='path/to/image.png' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='my/docs/folder/path/to/image.png' />\""
        );
    });

    it("should return an array of image paths from html image tags with multiple images", () => {
        const page =
            "This is a test page with an image <img src='path/to/image1.png' /> and another image <img src='path/to/image2.png' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image1.png", "my/docs/folder/path/to/image2.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='my/docs/folder/path/to/image1.png' /> and another image <img src='my/docs/folder/path/to/image2.png' />\""
        );
    });

    it("should return an array of image paths from both markdown and html image tags", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image1.png) and another image \n<img src='path/to/image2.png' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image1.png", "my/docs/folder/path/to/image2.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "This is a test page with an image ![image1](my/docs/folder/path/to/image1.png) and another image 
            <img src='my/docs/folder/path/to/image2.png' />"
        `);
    });

    it("should relativize absolute paths", () => {
        const page = "This is a test page with an image ![image](/path/to/image.png)";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](path/to/image.png)"'
        );
    });

    it("should relativize absolute paths in html image tags", () => {
        const page = "This is a test page with an image <img src='/path/to/image.png' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='path/to/image.png' />\""
        );
    });

    it("should relativize absolute paths in mdx img tags", () => {
        const page = "This is a test page with an image <img src={'/path/to/image.png'} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'path/to/image.png'} />\""
        );
    });

    it("should relativize absolute paths in html image tags with multiple images", () => {
        const page =
            "This is a test page with an image <img src='/path/to/image1.png' /> and another image <img src='/path/to/image2.png' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["path/to/image1.png", "path/to/image2.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='path/to/image1.png' /> and another image <img src='path/to/image2.png' />\""
        );
    });

    it("should relative absolute paths in mdx img tags with other props before src", () => {
        const page = "This is a test page with an image <img src={'/path/to/image.png'} alt='image' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'path/to/image.png'} alt='image' />\""
        );
    });

    it("should relative absolute paths in mdx img tags with other props after src", () => {
        const page = "This is a test page with an image <img style={{border: '1px'}} src={'/path/to/image.png'} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img style={{border: '1px'}} src={'path/to/image.png'} />\""
        );
    });

    it("should return an array of image paths inside CodeBlock", () => {
        const page = "This is a test page with an image <CodeBlock>{<img src='path/to/image.png' />}</CodeBlock>";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <CodeBlock>{<img src='my/docs/folder/path/to/image.png' />}</CodeBlock>\""
        );
    });

    it("should ignore non-html tags, but still parse img tags", () => {
        const page = "This is a test page with an image <Section> <img src='path/to/image.png' /> </Section>";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <Section> <img src='my/docs/folder/path/to/image.png' /> </Section>\""
        );
    });

    it("should accept mdx img tags", () => {
        const page = "This is a test page with an image <img src={'path/to/image.png'} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'my/docs/folder/path/to/image.png'} />\""
        );
    });

    it("should accept mdx img tags within a JSX prop", () => {
        const page = "This is a test page with an image <Node image={<img src='path/to/image.png' />} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual(["my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <Node image={<img src='my/docs/folder/path/to/image.png' />} />\""
        );
    });

    it("should ignore images inside inline code blocks", () => {
        const page = "This is a test page with an image ` <img src='path/to/image.png' /> `";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image ` <img src='path/to/image.png' /> `\""
        );
    });

    it("should ignore images inside code blocks", () => {
        const page = "This is a test page with an image \n```jsx\n<img src='path/to/image.png' />\n```";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "This is a test page with an image 
            \`\`\`jsx
            <img src='path/to/image.png' />
            \`\`\`"
        `);
    });

    it("should ignore images inside inline code inside JSX", () => {
        const page = "This is a test page with an image <CodeBlock>{`<img src='path/to/image.png' />`}</CodeBlock>";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <CodeBlock>{`<img src='path/to/image.png' />`}</CodeBlock>\""
        );
    });

    it("should ignore images inside fenced code blocks inside JSX", () => {
        const page =
            "This is a test page with an image \n\n<CodeBlock>\n\n```\n<img src='path/to/image.png' />\n```\n\n</CodeBlock>";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "This is a test page with an image 

            <CodeBlock>

            \`\`\`
            <img src='path/to/image.png' />
            \`\`\`

            </CodeBlock>"
        `);
    });

    it("should ignore external urls", () => {
        const page = "This is a test page with an image ![image](https://external.com/image.png)";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](https://external.com/image.png)"'
        );
    });

    it("should ignore external urls in html tags", () => {
        const page = "This is a test page with an image <img src='https://external.com/image.png' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='https://external.com/image.png' />\""
        );
    });

    it("should ignore external urls in mdx img tags", () => {
        const page = "This is a test page with an image <img src={'https://external.com/image.png'} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'https://external.com/image.png'} />\""
        );
    });

    it("should ignore img src if it is not a string", () => {
        const page = "This is a test page with an image <img src={pathToImage} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image <img src={pathToImage} />"'
        );
    });

    it("should ignore img src if it is an empty string", () => {
        const page = "This is a test page with an image <img src='' />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot("\"This is a test page with an image <img src='' />\"");
    });

    it("should ignore img src if it is an empty string in mdx img tags", () => {
        const page = "This is a test page with an image <img src={''} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot("\"This is a test page with an image <img src={''} />\"");
    });

    it("should ignore img src if it is a string with concatenated variables", () => {
        const page =
            "This is a test page with an image <img src={path + '/image.png'} /> <img src={'abc' + 'def.png'} />";
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={path + '/image.png'} /> <img src={'abc' + 'def.png'} />\""
        );
    });
});

describe("replaceImagePaths", () => {
    it("should replace image paths with fileIDs", () => {
        const page = "This is a test page with an image ![image](path/to/image.png)";
        const fileIds = new Map([[RelativeFilePath.of("path/to/image.png"), "fileID"]]);
        const result = replaceImagePaths(page, fileIds);
        expect(result).toMatchInlineSnapshot(`
            "This is a test page with an image ![image](fileID)
            "
        `);
    });
});

describe("bland", () => {
    it("should replace all images with full path", () => {
        // ensure that the relative path is expected to not start with "./"
        expect(relative(AbsoluteFilePath.of("/a/b/c/d"), AbsoluteFilePath.of("/a/b/e/f/g"))).toBe("../../e/f/g");
        expect(relative(AbsoluteFilePath.of("/a/b/c/d"), AbsoluteFilePath.of("/a/b/c/d/e/f/g"))).toBe("e/f/g");

        const page = fs.readFileSync(resolve(__dirname, "fixtures/bland.mdx"), "utf-8");
        const result = parseImagePaths(MDX_PATH, page);
        expect(result.filepaths).toMatchInlineSnapshot(`
            [
              "tutorials/node.png",
              "tutorials/new_pathway.png",
              "tutorials/final_pathway.png",
              "tutorials/pathway_label.png",
              "tutorials/condition_eg.png",
              "tutorials/global_node.png",
              "tutorials/global_eg.png",
              "tutorials/default_node.png",
              "tutorials/transfer_node.png",
              "tutorials/end_node.png",
              "tutorials/kb_node.png",
              "tutorials/webhook_node.png",
              "tutorials/add_global_prompt.png",
              "tutorials/live_call_logs.png",
              "tutorials/pathway_chat.png",
              "tutorials/extract_variables.png",
              "tutorials/pathwaylog_finetune.png",
              "tutorials/finetuned.png",
              "tutorials/finetune.png",
            ]
        `);
        expect(result.markdown).toMatchSnapshot();
        expect(diffLines(page, result.markdown).filter((page) => !!page.added || !!page.removed)).toMatchSnapshot();
    });
});
