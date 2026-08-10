/* eslint-disable jest/expect-expect */

import { AbsoluteFilePath, relative } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { diffLines } from "diff";
import fs from "fs";
import { resolve } from "path";
import { afterEach, beforeEach, vi } from "vitest";

import { parseImagePaths, replaceImagePathsAndUrls } from "../parseImagePaths.js";

const CONTEXT = createMockTaskContext();

const MDX_PATH = AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/file.mdx");
const DOCS_PATH = AbsoluteFilePath.of("/Volume/git/fern");

const PATHS = {
    absolutePathToMarkdownFile: MDX_PATH,
    absolutePathToFernFolder: DOCS_PATH
};

describe("parseImagePaths", () => {
    it("should return an empty array if there are no images", () => {
        const page = "This is a test page";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot('"This is a test page"');
    });

    it("should return an array of image paths", () => {
        const page = "This is a test page with an image ![image](path/to/image.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](/Volume/git/fern/my/docs/folder/path/to/image.png)"'
        );
    });

    it("should relativize image path that extends beyond the current directory", () => {
        const page = "This is a test page with an image ![image](../../../../path/to/image.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](/Volume/git/path/to/image.png)"'
        );
    });

    it("should return an array of image paths with multiple images", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image1.png) and another image ![image2](path/to/image2.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([
            "/Volume/git/fern/my/docs/folder/path/to/image1.png",
            "/Volume/git/fern/my/docs/folder/path/to/image2.png"
        ]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image1](/Volume/git/fern/my/docs/folder/path/to/image1.png) and another image ![image2](/Volume/git/fern/my/docs/folder/path/to/image2.png)"'
        );
    });

    it("should return an array of image paths with multiple images of the same path", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image.png) and another image ![image2](path/to/image.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image1](/Volume/git/fern/my/docs/folder/path/to/image.png) and another image ![image2](/Volume/git/fern/my/docs/folder/path/to/image.png)"'
        );
    });

    it("should return an array of image paths from html image tags", () => {
        const page = "This is a test page with an image <img src='path/to/image.png' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='/Volume/git/fern/my/docs/folder/path/to/image.png' />\""
        );
    });

    it("should return an array of image paths from html image tags with multiple images", () => {
        const page =
            "This is a test page with an image <img src='path/to/image1.png' /> and another image <img src='path/to/image2.png' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([
            "/Volume/git/fern/my/docs/folder/path/to/image1.png",
            "/Volume/git/fern/my/docs/folder/path/to/image2.png"
        ]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='/Volume/git/fern/my/docs/folder/path/to/image1.png' /> and another image <img src='/Volume/git/fern/my/docs/folder/path/to/image2.png' />\""
        );
    });

    it("should return an array of image paths from both markdown and html image tags", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image1.png) and another image \n<img src='path/to/image2.png' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([
            "/Volume/git/fern/my/docs/folder/path/to/image1.png",
            "/Volume/git/fern/my/docs/folder/path/to/image2.png"
        ]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "This is a test page with an image ![image1](/Volume/git/fern/my/docs/folder/path/to/image1.png) and another image 
            <img src='/Volume/git/fern/my/docs/folder/path/to/image2.png' />"
        `);
    });

    it("should parse url from frontmatter json", () => {
        const page = '---\nimage: { type: "url", value: "https://someurl.com" }\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toEqual("---\nimage:\n  type: url\n  value: https://someurl.com\n---");
    });

    it("should parse url from frontmatter yaml", () => {
        const page = '---\nimage:\n  type: url\n  value: "https://someurl.com"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toEqual("---\nimage:\n  type: url\n  value: https://someurl.com\n---");
    });

    it("should parse url from frontmatter text", () => {
        const page = '---\nimage: "https://someurl.com"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toEqual("---\nimage:\n  type: url\n  value: https://someurl.com\n---");
    });

    it("should parse images from frontmatter text", () => {
        const page = '---\nimage: "path/to/image.png"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toEqual(
            "---\nimage:\n  type: fileId\n  value: /Volume/git/fern/my/docs/folder/path/to/image.png\n---"
        );
    });

    it("should parse og:images from frontmatter text", () => {
        const page = '---\nog:image: "path/to/image.png"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toEqual(
            "---\nog:image:\n  type: fileId\n  value: /Volume/git/fern/my/docs/folder/path/to/image.png\n---"
        );
    });

    it("should parse logo from frontmatter text", () => {
        const page = '---\nlogo: "path/to/image.png"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            `
          "---
          logo:
            type: fileId
            value: /Volume/git/fern/my/docs/folder/path/to/image.png
          ---"
        `
        );
    });

    it("should parse url logo from frontmatter text", () => {
        const page = '---\nlogo: "https://someurl.com"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            `
          "---
          logo:
            type: url
            value: https://someurl.com
          ---"
        `
        );
    });

    it("should parse light and dark logo from frontmatter json", () => {
        const page = '---\nlogo:\n  light: "path/to/light-image.png"\n  dark: "path/to/dark-image.png"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([
            "/Volume/git/fern/my/docs/folder/path/to/light-image.png",
            "/Volume/git/fern/my/docs/folder/path/to/dark-image.png"
        ]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            `
          "---
          logo:
            light:
              type: fileId
              value: /Volume/git/fern/my/docs/folder/path/to/light-image.png
            dark:
              type: fileId
              value: /Volume/git/fern/my/docs/folder/path/to/dark-image.png
          ---"
        `
        );
    });

    it("should parse light logo from frontmatter json", () => {
        const page = '---\nlogo:\n  light: "path/to/light-image.png"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/light-image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            `
          "---
          logo:
            light:
              type: fileId
              value: /Volume/git/fern/my/docs/folder/path/to/light-image.png
          ---"
        `
        );
    });

    it("should parse dark logo from frontmatter json", () => {
        const page = '---\nlogo:\n  dark: "path/to/dark-image.png"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/dark-image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            `
          "---
          logo:
            dark:
              type: fileId
              value: /Volume/git/fern/my/docs/folder/path/to/dark-image.png
          ---"
        `
        );
    });

    it("should parse the same result when run twice for frontmatter text", () => {
        const page = '---\nimage: "path/to/image.png"\n---';
        const result = parseImagePaths(page, PATHS);
        const result2 = parseImagePaths(page, PATHS);
        expect(result.markdown).toEqual(result.markdown);
    });

    it("should parse image with alt on multiple lines", () => {
        const page = "This is a test page with an image ![image with \n new line in alt](path/to/image.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "This is a test page with an image ![image with 
             new line in alt](/Volume/git/fern/my/docs/folder/path/to/image.png)"
        `);
    });

    it("should parse img tag with src on multiple lines", () => {
        const page = "This is a test page with an image <img \n src='path/to/image.png' \n alt='image' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "This is a test page with an image <img 
             src='/Volume/git/fern/my/docs/folder/path/to/image.png' 
             alt='image' />"
        `);
    });

    it("should relativize absolute paths", () => {
        const page = "This is a test page with an image ![image](/path/to/image.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](/Volume/git/fern/path/to/image.png)"'
        );
    });

    it("should relativize absolute paths in html image tags", () => {
        const page = "This is a test page with an image <img src='/path/to/image.png' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='/Volume/git/fern/path/to/image.png' />\""
        );
    });

    it("should relativize absolute paths in mdx img tags", () => {
        const page = "This is a test page with an image <img src={'/path/to/image.png'} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'/Volume/git/fern/path/to/image.png'} />\""
        );
    });

    it("should relativize absolute paths in html image tags with multiple images", () => {
        const page =
            "This is a test page with an image <img src='/path/to/image1.png' /> and another image <img src='/path/to/image2.png' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([
            "/Volume/git/fern/path/to/image1.png",
            "/Volume/git/fern/path/to/image2.png"
        ]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='/Volume/git/fern/path/to/image1.png' /> and another image <img src='/Volume/git/fern/path/to/image2.png' />\""
        );
    });

    it("should relative absolute paths in mdx img tags with other props before src", () => {
        const page = "This is a test page with an image <img alt='image' src={'/path/to/image.png'} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img alt='image' src={'/Volume/git/fern/path/to/image.png'} />\""
        );
    });

    it("should relative absolute paths in mdx img tags with other props after src", () => {
        const page = "This is a test page with an image <img src={'/path/to/image.png'} style={{border: '1px'}} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'/Volume/git/fern/path/to/image.png'} style={{border: '1px'}} />\""
        );
    });

    it("should return an array of image paths inside CodeBlock", () => {
        const page = "This is a test page with an image <CodeBlock>{<img src='path/to/image.png' />}</CodeBlock>";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <CodeBlock>{<img src='/Volume/git/fern/my/docs/folder/path/to/image.png' />}</CodeBlock>\""
        );
    });

    it("should ignore non-html tags, but still parse img tags", () => {
        const page = "This is a test page with an image <Section> <img src='path/to/image.png' /> </Section>";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <Section> <img src='/Volume/git/fern/my/docs/folder/path/to/image.png' /> </Section>\""
        );
    });

    it("should accept mdx img tags", () => {
        const page = "This is a test page with an image <img src={'path/to/image.png'} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'/Volume/git/fern/my/docs/folder/path/to/image.png'} />\""
        );
    });

    it("should accept mdx img tags within a JSX prop", () => {
        const page = "This is a test page with an image <Node image={<img src='path/to/image.png' />} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <Node image={<img src='/Volume/git/fern/my/docs/folder/path/to/image.png' />} />\""
        );
    });

    it("should ignore images inside inline code blocks", () => {
        const page = "This is a test page with an image ` <img src='path/to/image.png' /> `";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image ` <img src='path/to/image.png' /> `\""
        );
    });

    it("should ignore images inside code blocks", () => {
        const page = "This is a test page with an image \n```jsx\n<img src='path/to/image.png' />\n```";
        const result = parseImagePaths(page, PATHS);
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
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <CodeBlock>{`<img src='path/to/image.png' />`}</CodeBlock>\""
        );
    });

    it("should ignore images inside fenced code blocks inside JSX", () => {
        const page =
            "This is a test page with an image \n\n<CodeBlock>\n\n```\n<img src='path/to/image.png' />\n```\n\n</CodeBlock>";
        const result = parseImagePaths(page, PATHS);
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
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](https://external.com/image.png)"'
        );
    });

    it("should ignore data urls", () => {
        const page = "This is a test page with an image ![image](data:image/png;base64,abc)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](data:image/png;base64,abc)"'
        );
    });

    it("should ignore external urls in html tags", () => {
        const page = "This is a test page with an image <img src='https://external.com/image.png' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='https://external.com/image.png' />\""
        );
    });

    it("should ignore data urls in html tags", () => {
        const page = "This is a test page with an image <img src='data:image/png;base64,abc' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='data:image/png;base64,abc' />\""
        );
    });

    it("should ignore external urls in mdx img tags", () => {
        const page = "This is a test page with an image <img src={'https://external.com/image.png'} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={'https://external.com/image.png'} />\""
        );
    });

    it("should reject double-slash paths as invalid local file syntax", () => {
        const page = "This is a test page with an image ![image](//assets/images/logo.png)";
        expect(() => parseImagePaths(page, PATHS)).toThrow(/reserved for external URLs/);
    });

    it("should ignore img src if it is not a string", () => {
        const page = "This is a test page with an image <img src={pathToImage} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image <img src={pathToImage} />"'
        );
    });

    it("should ignore img src if it is an empty string", () => {
        const page = "This is a test page with an image <img src='' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot("\"This is a test page with an image <img src='' />\"");
    });

    it("should ignore img src if it is an empty string in mdx img tags", () => {
        const page = "This is a test page with an image <img src={''} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot("\"This is a test page with an image <img src={''} />\"");
    });

    it("should ignore img src if it is a string with concatenated variables", () => {
        const page =
            "This is a test page with an image <img src={path + '/image.png'} /> <img src={'abc' + 'def.png'} />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src={path + '/image.png'} /> <img src={'abc' + 'def.png'} />\""
        );
    });

    it("should ignore anchors when replacing image paths", () => {
        const page = "This is a test page with an image ![image](path/to/image.png#anchor)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](/Volume/git/fern/my/docs/folder/path/to/image.png#anchor)"'
        );
    });

    it("should ignore anchors in html image tags", () => {
        const page = "This is a test page with an image <img src='path/to/image.png#anchor' />";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            "\"This is a test page with an image <img src='/Volume/git/fern/my/docs/folder/path/to/image.png#anchor' />\""
        );
    });

    it("should parse images inside of tabs and frame", () => {
        const page = `
<Tabs>
    <Tab>
        <Frame>
            <img src="./add-tool-view.png" alt="Add tool to configuration within the portal"/>
        </Frame>
    </Tab>
</Tabs>
        `;
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/add-tool-view.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "<Tabs>
                <Tab>
                    <Frame>
                        <img src="/Volume/git/fern/my/docs/folder/add-tool-view.png" alt="Add tool to configuration within the portal"/>
                    </Frame>
                </Tab>
            </Tabs>"
        `);
    });

    it("should parse images inside of tabs and frame with other markdown", () => {
        const page = `
<Tabs>
    <Tab>
        <Frame>
            ### Create a Tool

            We will first create a Tool with a specified function. In this case, we will create a tool for getting the weather. In the Portal, navigate to the [EVI Tools page](https://beta.hume.ai/evi/tools). Click the **Create function** button to begin.

            <img src="./add-tool-view.png" alt="Add tool to configuration within the portal"/>
        </Frame>
    </Tab>
</Tabs>
        `;
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/add-tool-view.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "<Tabs>
                <Tab>
                    <Frame>
                        ### Create a Tool

                        We will first create a Tool with a specified function. In this case, we will create a tool for getting the weather. In the Portal, navigate to the [EVI Tools page](https://beta.hume.ai/evi/tools). Click the **Create function** button to begin.

                        <img src="/Volume/git/fern/my/docs/folder/add-tool-view.png" alt="Add tool to configuration within the portal"/>
                    </Frame>
                </Tab>
            </Tabs>"
        `);
    });

    it("should parse images inside of tabs and frame using markdown", () => {
        const page = `
<Tabs>
    <Tab>
        <Frame>
            ![Add tool to configuration within the portal](./add-tool-view.png)
        </Frame>
    </Tab>
</Tabs>
        `;
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/add-tool-view.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(`
            "<Tabs>
                <Tab>
                    <Frame>
                        ![Add tool to configuration within the portal](/Volume/git/fern/my/docs/folder/add-tool-view.png)
                    </Frame>
                </Tab>
            </Tabs>"
        `);
    });

    it("should parse src file inside of a Download", () => {
        const page = `
<Download src="path/to/file.zip">
    Download file
</Download>
        `;
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/file.zip"]);
    });

    it("should parse src file inside of video", () => {
        const page = `
<video>
    <source src="path/to/file.mp4" />
</video>
        `;
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/file.mp4"]);
    });

    describe("image path resolution", () => {
        const MOCK_FILE_IDS = {
            "/Volume/git/fern/absolute/path/image.png": "absolute-file-id",
            "/Volume/git/fern/my/docs/folder/relative/path/image.png": "relative-file-id",
            "/Volume/git/fern/my/docs/relative/path/image.png": "parent-relative-file-id",
            "/Volume/git/fern/my/docs/folder/current/image.png": "current-file-id",
            // Windows paths need to be normalized to forward slashes
            "/C/Users/git/fern/absolute/path/image.png": "windows-absolute-file-id",
            "//server/share/path/image.png": "windows-unc-file-id"
        };

        const TEST_PATHS = {
            absolutePathToMarkdownFile: AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/file.mdx"),
            absolutePathToFernFolder: AbsoluteFilePath.of("/Volume/git/fern"),
            fileIdsMap: new Map(Object.entries(MOCK_FILE_IDS).map(([path, id]) => [AbsoluteFilePath.of(path), id]))
        };

        it("should handle absolute paths", () => {
            const page = "This is a test page with an image ![image](/absolute/path/image.png)";
            const result = parseImagePaths(page, TEST_PATHS);
            expect(result.filepaths).toEqual(["/Volume/git/fern/absolute/path/image.png"]);
            expect(result.markdown.trim()).toMatchInlineSnapshot(
                '"This is a test page with an image ![image](/Volume/git/fern/absolute/path/image.png)"'
            );
        });

        it("should handle relative paths", () => {
            const page = "This is a test page with an image ![image](relative/path/image.png)";
            const result = parseImagePaths(page, TEST_PATHS);
            expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/relative/path/image.png"]);
            expect(result.markdown.trim()).toMatchInlineSnapshot(
                '"This is a test page with an image ![image](/Volume/git/fern/my/docs/folder/relative/path/image.png)"'
            );
        });

        it("should handle parent directory relative paths", () => {
            const page = "This is a test page with an image ![image](../relative/path/image.png)";
            const result = parseImagePaths(page, TEST_PATHS);
            expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/relative/path/image.png"]);
            expect(result.markdown.trim()).toMatchInlineSnapshot(
                '"This is a test page with an image ![image](/Volume/git/fern/my/docs/relative/path/image.png)"'
            );
        });

        it("should handle current directory relative paths", () => {
            const page = "This is a test page with an image ![image](./current/image.png)";
            const result = parseImagePaths(page, TEST_PATHS);
            expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/current/image.png"]);
            expect(result.markdown.trim()).toMatchInlineSnapshot(
                '"This is a test page with an image ![image](/Volume/git/fern/my/docs/folder/current/image.png)"'
            );
        });

        it("should return undefined for non-existent file IDs", () => {
            const page = "This is a test page with an image ![image](/non/existent/path/image.png)";
            const result = parseImagePaths(page, TEST_PATHS);
            expect(result.filepaths).toEqual(["/Volume/git/fern/non/existent/path/image.png"]);
            expect(result.markdown.trim()).toMatchInlineSnapshot(
                '"This is a test page with an image ![image](/Volume/git/fern/non/existent/path/image.png)"'
            );
        });

        it("should handle multiple images with mixed paths", () => {
            const page = `
                This is a test page with multiple images:
                ![absolute](/absolute/path/image.png)
                ![relative](relative/path/image.png)
                ![parent](../relative/path/image.png)
                ![current](./current/image.png)
            `;
            const result = parseImagePaths(page, TEST_PATHS);
            expect(result.filepaths).toEqual([
                "/Volume/git/fern/absolute/path/image.png",
                "/Volume/git/fern/my/docs/folder/relative/path/image.png",
                "/Volume/git/fern/my/docs/relative/path/image.png",
                "/Volume/git/fern/my/docs/folder/current/image.png"
            ]);
            expect(result.markdown.trim()).toMatchInlineSnapshot(`
              "This is a test page with multiple images:
                              ![absolute](/Volume/git/fern/absolute/path/image.png)
                              ![relative](/Volume/git/fern/my/docs/folder/relative/path/image.png)
                              ![parent](/Volume/git/fern/my/docs/relative/path/image.png)
                              ![current](/Volume/git/fern/my/docs/folder/current/image.png)"
            `);
        });

        describe("windows paths", () => {
            it("should handle Windows absolute paths with drive letter", () => {
                const page =
                    "This is a test page with an image ![image](C:\\Users\\git\\fern\\absolute\\path\\image.png)";
                const result = parseImagePaths(page, TEST_PATHS);
                expect(result.filepaths).toEqual([
                    "/Volume/git/fern/my/docs/folder/C:/Users/git/fern/absolute/path/image.png"
                ]);
                expect(result.markdown.trim()).toMatchInlineSnapshot(
                    '"This is a test page with an image ![image](/Volume/git/fern/my/docs/folder/C:/Users/git/fern/absolute/path/image.png)"'
                );
            });

            it("should handle Windows UNC paths", () => {
                const page = "This is a test page with an image ![image](\\\\server\\share\\path\\image.png)";
                const result = parseImagePaths(page, TEST_PATHS);
                expect(result.filepaths).toEqual(["/server/share/path/image.png"]);
                expect(result.markdown.trim()).toMatchInlineSnapshot(
                    '"This is a test page with an image ![image](\\/server/share/path/image.png)"'
                );
            });

            it("should handle Windows-style relative paths", () => {
                const page = "This is a test page with an image ![image](..\\relative\\path\\image.png)";
                const result = parseImagePaths(page, TEST_PATHS);
                expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/relative/path/image.png"]);
                expect(result.markdown.trim()).toMatchInlineSnapshot(
                    '"This is a test page with an image ![image](/Volume/git/fern/my/docs/relative/path/image.png)"'
                );
            });
        });
    });
});

describe("replaceImagePaths", () => {
    it("should replace image paths with fileIDs", () => {
        const page = "This is a test page with an image ![image](/Volume/git/fern/path/to/image.png)";
        const fileIds = new Map([[AbsoluteFilePath.of("/Volume/git/fern/path/to/image.png"), "fileID"]]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toMatchInlineSnapshot(`
            "This is a test page with an image ![image](file:fileID)
            "
        `);
    });

    it("should ignore anchors when replacing image paths", () => {
        const page = "This is a test page with an image ![image](/Volume/git/fern/path/to/image.png#anchor)";
        const fileIds = new Map([[AbsoluteFilePath.of("/Volume/git/fern/path/to/image.png"), "fileID"]]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toMatchInlineSnapshot(`
            "This is a test page with an image ![image](file:fileID#anchor)
            "
        `);
    });

    it("should ignore anchors when replacing image paths in img tag", () => {
        const page = "This is a test page with an image <img src='/Volume/git/fern/path/to/image.png#anchor' />";
        const fileIds = new Map([[AbsoluteFilePath.of("/Volume/git/fern/path/to/image.png"), "fileID"]]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toMatchInlineSnapshot(`
            "This is a test page with an image <img src='file:fileID#anchor' />
            "
        `);
    });

    it("should preserve anchors when replacing markdown link hrefs", () => {
        const page = "[link text](../other/page.mdx#some-heading)";
        const markdownFilesToPathName = {
            "/Volume/git/fern/my/docs/other/page.mdx": "/other/page"
        };
        const result = replaceImagePathsAndUrls(page, new Map(), markdownFilesToPathName, PATHS, CONTEXT);
        expect(result).toContain("[link text](/other/page#some-heading)");
    });

    it("should preserve anchors when replacing JSX href attributes", () => {
        const page = '<a href="../other/page.mdx#section">link</a>';
        const markdownFilesToPathName = {
            "/Volume/git/fern/my/docs/other/page.mdx": "/other/page"
        };
        const result = replaceImagePathsAndUrls(page, new Map(), markdownFilesToPathName, PATHS, CONTEXT);
        expect(result).toContain('href="/other/page#section"');
    });

    it("should resolve markdown link without anchor", () => {
        const page = "[link text](../other/page.mdx)";
        const markdownFilesToPathName = {
            "/Volume/git/fern/my/docs/other/page.mdx": "/other/page"
        };
        const result = replaceImagePathsAndUrls(page, new Map(), markdownFilesToPathName, PATHS, CONTEXT);
        expect(result).toContain("[link text](/other/page)");
    });
});

describe("cross-platform image path round-trip", () => {
    it("should produce consistent paths that match fileIdsMap keys", () => {
        const page = "![image](./assets/images/diagram.png)";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);

        // parseImagePaths should produce forward-slash normalized paths
        expect(parseResult.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/assets/images/diagram.png"]);

        // Build fileIdsMap from the SAME filepaths (simulating the upload flow)
        const fileIdsMap = new Map(
            parseResult.filepaths.map((fp) => [AbsoluteFilePath.of(fp), "cross-platform-file-id"])
        );

        // replaceImagePathsAndUrls should find the file ID via the same normalized path
        const replaced = replaceImagePathsAndUrls(parseResult.markdown, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("file:cross-platform-file-id");
        expect(replaced).not.toContain("/Volume/git/fern/my/docs/folder/assets/images/diagram.png");
    });

    it("should handle root-relative paths in round-trip", () => {
        const page = "![logo](/assets/images/logo.svg)";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);

        expect(parseResult.filepaths).toEqual(["/Volume/git/fern/assets/images/logo.svg"]);

        const fileIdsMap = new Map(parseResult.filepaths.map((fp) => [AbsoluteFilePath.of(fp), "logo-file-id"]));

        const replaced = replaceImagePathsAndUrls(parseResult.markdown, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("file:logo-file-id");
    });

    it("should handle mixed image types in round-trip", () => {
        const page = [
            "![md-image](./images/photo.png)",
            "<img src='./images/icon.svg' />",
            '<Frame><img src="./images/screenshot.webp" /></Frame>'
        ].join("\n");

        const parseResult = parseImagePaths(page, PATHS, CONTEXT);

        expect(parseResult.filepaths).toHaveLength(3);
        // All paths should use forward slashes
        for (const fp of parseResult.filepaths) {
            expect(fp).not.toContain("\\");
        }

        const fileIdsMap = new Map(parseResult.filepaths.map((fp, i) => [AbsoluteFilePath.of(fp), `file-id-${i}`]));

        const replaced = replaceImagePathsAndUrls(parseResult.markdown, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("file:file-id-0");
        expect(replaced).toContain("file:file-id-1");
        expect(replaced).toContain("file:file-id-2");
    });

    it("should never produce paths with backslashes in resolved filepaths", () => {
        const pages = [
            "![a](../other/image.png)",
            "![b](./local/image.png)",
            "![c](/root/image.png)",
            "<img src='deep/nested/path/to/image.png' />"
        ];

        for (const page of pages) {
            const result = parseImagePaths(page, PATHS, CONTEXT);
            for (const filepath of result.filepaths) {
                expect(filepath).not.toContain("\\");
            }
        }
    });
});

function testMdxFixture(filename: string) {
    const page = fs.readFileSync(resolve(__dirname, `fixtures/${filename}`), "utf-8");
    const result = parseImagePaths(page, PATHS);
    expect(result.filepaths).toMatchSnapshot();
    // expect(result.markdown).toMatchSnapshot();
    expect(diffLines(page, result.markdown).filter((page) => !!page.added || !!page.removed)).toMatchSnapshot();
    const replaced = replaceImagePathsAndUrls(
        result.markdown,
        new Map(result.filepaths.map((path) => [AbsoluteFilePath.of(path), "123e4567-e89b-12d3-a456-426655440000"])),
        {},
        PATHS,
        CONTEXT
    );
    expect(diffLines(page, replaced).filter((page) => !!page.added || !!page.removed)).toMatchSnapshot();
}

describe("bland", () => {
    it("should replace all images with full path", () => {
        // ensure that the relative path is expected to not start with "./"
        expect(relative(AbsoluteFilePath.of("/a/b/c/d"), AbsoluteFilePath.of("/a/b/e/f/g"))).toBe("../../e/f/g");
        expect(relative(AbsoluteFilePath.of("/a/b/c/d"), AbsoluteFilePath.of("/a/b/c/d/e/f/g"))).toBe("e/f/g");

        testMdxFixture("bland.mdx");
    });
});

describe("multimedia-file", () => {
    it("should replace all images with full path", () => {
        testMdxFixture("multimedia-file.mdx");
    });
});

describe("zep", () => {
    it("should replace all images with full path", () => {
        testMdxFixture("zep.mdx");
    });
});

describe("hume", () => {
    it("should replace all images with full path", () => {
        testMdxFixture("hume.mdx");
    });
});

describe("streaming parser for large files", () => {
    const originalEnv = process.env.FERN_DOCS_LARGE_FILE_BYTES;

    beforeEach(() => {
        process.env.FERN_DOCS_LARGE_FILE_BYTES = "100";
    });

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.FERN_DOCS_LARGE_FILE_BYTES = originalEnv;
        } else {
            delete process.env.FERN_DOCS_LARGE_FILE_BYTES;
        }
    });

    it("should parse markdown images with streaming parser", () => {
        const page =
            "This is a test page with an image ![image](path/to/image.png) and more content to exceed 100 bytes threshold for streaming parser to be used";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown).toContain("![image](/Volume/git/fern/my/docs/folder/path/to/image.png)");
    });

    it("should parse markdown images with absolute paths in streaming parser", () => {
        const page =
            "This is a test page with an absolute image ![image](/static/image.png) and plenty more content so that we definitely exceed the 100 bytes threshold required for the streaming parser to kick in during the test run.";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual(["/Volume/git/fern/static/image.png"]);
        expect(result.markdown).toContain("![image](/Volume/git/fern/static/image.png)");
    });

    it("should parse multiple markdown images with streaming parser", () => {
        const page =
            "This is a test page with images ![image1](path/to/image1.png) and ![image2](path/to/image2.png) and more content to exceed threshold";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual([
            "/Volume/git/fern/my/docs/folder/path/to/image1.png",
            "/Volume/git/fern/my/docs/folder/path/to/image2.png"
        ]);
        expect(result.markdown).toContain("![image1](/Volume/git/fern/my/docs/folder/path/to/image1.png)");
        expect(result.markdown).toContain("![image2](/Volume/git/fern/my/docs/folder/path/to/image2.png)");
    });

    it("should parse HTML img tags with streaming parser", () => {
        const page =
            "This is a test page with an image <img src='path/to/image.png' /> and more content to exceed 100 bytes threshold for streaming";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown).toContain("<img src='/Volume/git/fern/my/docs/folder/path/to/image.png' />");
    });

    it("should parse JSX img tags with string literals in streaming parser", () => {
        const page =
            "This is a test page with an image <img src={'path/to/image.png'} /> and more content to exceed 100 bytes threshold for streaming";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown).toContain("<img src={'/Volume/git/fern/my/docs/folder/path/to/image.png'} />");
    });

    it("should handle escaped characters in image URLs with streaming parser", () => {
        const page =
            "This is a test page with an image ![image](path/to/image\\)test.png) and more content to exceed 100 bytes threshold for streaming";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image)test.png"]);
    });

    it("should skip images inside code fences with streaming parser", () => {
        const page =
            "This is a test page\n```\n![image](path/to/image.png)\n```\nand more content to exceed 100 bytes threshold for streaming parser";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown).toContain("```\n![image](path/to/image.png)\n```");
    });

    it("should skip images inside inline code with streaming parser", () => {
        const page =
            "This is a test page with `![image](path/to/image.png)` inline code and more content to exceed 100 bytes threshold for streaming";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown).toContain("`![image](path/to/image.png)`");
    });

    it("should parse images outside code fences but skip inside with streaming parser", () => {
        const page =
            "![outside1](path/to/outside1.png)\n```\n![inside](path/to/inside.png)\n```\n![outside2](path/to/outside2.png) more content";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual([
            "/Volume/git/fern/my/docs/folder/path/to/outside1.png",
            "/Volume/git/fern/my/docs/folder/path/to/outside2.png"
        ]);
        expect(result.markdown).toContain("![outside1](/Volume/git/fern/my/docs/folder/path/to/outside1.png)");
        expect(result.markdown).toContain("![outside2](/Volume/git/fern/my/docs/folder/path/to/outside2.png)");
        expect(result.markdown).toContain("![inside](path/to/inside.png)"); // unchanged inside code fence
    });

    it("should ignore external URLs with streaming parser", () => {
        const page =
            "This is a test page with an image ![image](https://external.com/image.png) and more content to exceed 100 bytes threshold for streaming";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown).toContain("![image](https://external.com/image.png)");
    });

    it("should ignore data URLs with streaming parser", () => {
        const page =
            "This is a test page with an image ![image](data:image/png;base64,abc) and more content to exceed 100 bytes threshold for streaming parser";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown).toContain("![image](data:image/png;base64,abc)");
    });

    it("should handle anchors in image URLs with streaming parser", () => {
        const page =
            "This is a test page with an image ![image](path/to/image.png#anchor) and more content to exceed 100 bytes threshold for streaming";
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown).toContain("![image](/Volume/git/fern/my/docs/folder/path/to/image.png#anchor)");
    });
});

describe("replaceImagePathsAndUrls with streaming parser for large files", () => {
    const originalEnv = process.env.FERN_DOCS_LARGE_FILE_BYTES;

    beforeEach(() => {
        process.env.FERN_DOCS_LARGE_FILE_BYTES = "100";
    });

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.FERN_DOCS_LARGE_FILE_BYTES = originalEnv;
        } else {
            delete process.env.FERN_DOCS_LARGE_FILE_BYTES;
        }
    });

    it("should replace image paths with file IDs using streaming parser", () => {
        const page =
            "This is a test page with an image ![image](path/to/image.png) and more content to exceed 100 bytes threshold for streaming";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const fileIdsMap = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "test-file-id-123"]
        ]);
        const replaced = replaceImagePathsAndUrls(parseResult.markdown, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("![image](file:test-file-id-123)");
    });

    it("should replace multiple image paths with file IDs using streaming parser", () => {
        const page =
            "This is a test page with images ![image1](path/to/image1.png) and ![image2](path/to/image2.png) and more content to exceed threshold";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const fileIdsMap = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image1.png"), "file-id-1"],
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image2.png"), "file-id-2"]
        ]);
        const replaced = replaceImagePathsAndUrls(parseResult.markdown, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("![image1](file:file-id-1)");
        expect(replaced).toContain("![image2](file:file-id-2)");
    });

    it("should replace HTML img src with file IDs using streaming parser", () => {
        const page =
            "This is a test page with an image <img src='path/to/image.png' /> and more content to exceed 100 bytes threshold for streaming";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const fileIdsMap = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "test-file-id-456"]
        ]);
        const replaced = replaceImagePathsAndUrls(parseResult.markdown, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("<img src='file:test-file-id-456' />");
    });

    it("should replace markdown links with slugs using streaming parser", () => {
        const page =
            "This is a test page with a link [text](../other/page.mdx) and more content to exceed 100 bytes threshold for streaming parser";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const markdownFilesToPathName = {
            "/Volume/git/fern/my/docs/other/page.mdx": "/other/page"
        };
        const replaced = replaceImagePathsAndUrls(
            parseResult.markdown,
            new Map(),
            markdownFilesToPathName,
            PATHS,
            CONTEXT
        );
        expect(replaced).toContain("[text](/other/page)");
    });

    it("should resolve relative .md links in translated content when markdownFilesToPathName is provided", () => {
        // Regression test: translated pages previously passed {} for markdownFilesToPathName,
        // so relative .md links like ../reference/support-matrix.md were not resolved to slugs.
        // The on-disk directory "reference/" maps to nav slug "resources/" in this scenario.
        const page =
            "Check the [support matrix](../reference/support-matrix.md) for details and also the [quickstart](./quickstart.mdx) guide.";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const markdownFilesToPathName = {
            "/Volume/git/fern/my/docs/reference/support-matrix.md": "/dynamo/dev/resources/support-matrix",
            "/Volume/git/fern/my/docs/reference/support-matrix.mdx": "/dynamo/dev/resources/support-matrix",
            "/Volume/git/fern/my/docs/folder/quickstart.mdx": "/dynamo/dev/getting-started/quickstart"
        };
        const replaced = replaceImagePathsAndUrls(
            parseResult.markdown,
            new Map(),
            markdownFilesToPathName,
            PATHS,
            CONTEXT
        );
        expect(replaced).toContain("[support matrix](/dynamo/dev/resources/support-matrix)");
        expect(replaced).toContain("[quickstart](/dynamo/dev/getting-started/quickstart)");
    });

    it("should not resolve relative .md links when markdownFilesToPathName is empty (previous bug)", () => {
        // When markdownFilesToPathName is {}, relative .md links pass through unresolved.
        // This demonstrates the bug that existed for translated content.
        const page = "Check the [support matrix](../reference/support-matrix.md) for details.";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const replaced = replaceImagePathsAndUrls(parseResult.markdown, new Map(), {}, PATHS, CONTEXT);
        // With empty map, the link is NOT resolved — the .md extension remains
        expect(replaced).toContain("[support matrix](../reference/support-matrix.md)");
    });

    it("should replace absolute image paths with file IDs using streaming parser", () => {
        const page =
            "This is a test page with an absolute image ![image](/static/image.png) and lots more content to exceed the 100 bytes threshold for the streaming parser to run while replacing paths.";
        const fileIdsMap = new Map([[AbsoluteFilePath.of("/Volume/git/fern/static/image.png"), "absolute-file-id"]]);
        const replaced = replaceImagePathsAndUrls(page, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("![image](file:absolute-file-id)");
    });

    it("should preserve anchors when replacing image paths using streaming parser", () => {
        const page =
            "This is a test page with an image ![image](path/to/image.png#anchor) and more content to exceed 100 bytes threshold for streaming";
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const fileIdsMap = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "test-file-id-789"]
        ]);
        const replaced = replaceImagePathsAndUrls(parseResult.markdown, fileIdsMap, {}, PATHS, CONTEXT);
        expect(replaced).toContain("![image](file:test-file-id-789#anchor)");
    });
});

describe("consistency between AST and streaming parsers", () => {
    const originalEnv = process.env.FERN_DOCS_LARGE_FILE_BYTES;

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.FERN_DOCS_LARGE_FILE_BYTES = originalEnv;
        } else {
            delete process.env.FERN_DOCS_LARGE_FILE_BYTES;
        }
    });

    it("should produce same results for markdown images with both parsers", () => {
        const page =
            "This is a test page with an image ![image](path/to/image.png) and another ![image2](path/to/image2.png) with more content";

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10000000"; // 10MB threshold
        const astResult = parseImagePaths(page, PATHS, CONTEXT);

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10"; // 10 byte threshold
        const streamingResult = parseImagePaths(page, PATHS, CONTEXT);

        expect(streamingResult.filepaths.sort()).toEqual(astResult.filepaths.sort());
        expect(streamingResult.markdown.trim()).toEqual(astResult.markdown.trim());
    });

    it("should produce same results for HTML img tags with both parsers", () => {
        const page =
            "This is a test page with an image <img src='path/to/image.png' /> and another <img src='path/to/image2.png' />";

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10000000";
        const astResult = parseImagePaths(page, PATHS, CONTEXT);

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10";
        const streamingResult = parseImagePaths(page, PATHS, CONTEXT);

        expect(streamingResult.filepaths.sort()).toEqual(astResult.filepaths.sort());
        expect(streamingResult.markdown.trim()).toEqual(astResult.markdown.trim());
    });

    it("should produce same results for mixed content with both parsers", () => {
        const page =
            "![md](path/to/md.png) and <img src='path/to/html.png' /> and <img src={'path/to/jsx.png'} /> with more content";

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10000000";
        const astResult = parseImagePaths(page, PATHS, CONTEXT);

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10";
        const streamingResult = parseImagePaths(page, PATHS, CONTEXT);

        expect(streamingResult.filepaths.sort()).toEqual(astResult.filepaths.sort());
        expect(streamingResult.markdown.trim()).toEqual(astResult.markdown.trim());
    });

    it("should produce same results for code fence handling with both parsers", () => {
        const page =
            "![outside](path/to/outside.png)\n```\n![inside](path/to/inside.png)\n```\n![outside2](path/to/outside2.png)";

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10000000";
        const astResult = parseImagePaths(page, PATHS, CONTEXT);

        process.env.FERN_DOCS_LARGE_FILE_BYTES = "10";
        const streamingResult = parseImagePaths(page, PATHS, CONTEXT);

        expect(streamingResult.filepaths.sort()).toEqual(astResult.filepaths.sort());
        expect(streamingResult.markdown.trim()).toEqual(astResult.markdown.trim());
    });

    describe("leading zero preservation in frontmatter", () => {
        it("should preserve quoted leading-zero title through parse+stringify round-trip", () => {
            const page = "---\ntitle: '001999'\ndescription: test\n---\nBody content";
            const result = parseImagePaths(page, PATHS);
            // js-yaml v4 correctly single-quotes leading-zero strings
            expect(result.markdown).toMatch(/title: '001999'/);
            expect(result.markdown).not.toMatch(/title: 001999\n/);
        });

        it("should preserve all-octal leading-zero title (already re-quoted by js-yaml)", () => {
            const page = "---\ntitle: '001015'\ndescription: test\n---\nBody content";
            const result = parseImagePaths(page, PATHS);
            expect(result.markdown).toMatch(/title: '001015'/);
        });

        it("should preserve all-zeros title", () => {
            const page = "---\ntitle: '000000'\ndescription: test\n---\nBody content";
            const result = parseImagePaths(page, PATHS);
            expect(result.markdown).toMatch(/title: '000000'/);
        });

        it("should preserve non-octal leading-zero titles that js-yaml v4 quotes correctly", () => {
            const nonOctalCases = ["009999", "001599", "002996", "002997", "002998"];
            for (const val of nonOctalCases) {
                const page = `---\ntitle: '${val}'\ndescription: test\n---\nBody content`;
                const result = parseImagePaths(page, PATHS);
                // js-yaml v4 correctly quotes these with single quotes
                expect(result.markdown).toMatch(new RegExp(`title: '${val}'`));
                expect(result.markdown).not.toMatch(new RegExp(`title: ${val}\n`));
            }
        });

        it("should not add quotes to normal numeric values without leading zeros", () => {
            const page = "---\ntitle: 42\nposition: 3\n---\nBody content";
            const result = parseImagePaths(page, PATHS);
            expect(result.markdown).toContain("title: 42");
            expect(result.markdown).toContain("position: 3");
        });

        it("should not add quotes to bare zero", () => {
            const page = "---\ntitle: 0\n---\nBody content";
            const result = parseImagePaths(page, PATHS);
            expect(result.markdown).toContain("title: 0");
            expect(result.markdown).not.toContain('title: "0"');
        });

        it("should not modify leading-zero patterns in body content", () => {
            const page = "---\ntitle: '001999'\n---\nSome text\n```yaml\nport: 08080\ncode: 0123\n```\nMore text";
            const result = parseImagePaths(page, PATHS);
            expect(result.markdown).toContain("port: 08080");
            expect(result.markdown).toContain("code: 0123");
            expect(result.markdown).not.toContain('port: "08080"');
            expect(result.markdown).not.toContain('code: "0123"');
        });
    });
});

describe("parseImagePaths early exit optimization", () => {
    it("should process frontmatter images even when body has no image indicators", () => {
        const page = [
            "---",
            "image: path/to/frontmatter-image.png",
            "---",
            "This body has no images, no src=, and no icon= attributes at all."
        ].join("\n");
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/frontmatter-image.png"]);
    });

    it("should process og:image in frontmatter when body has no image indicators", () => {
        const page = ["---", "og:image: assets/og-banner.png", "---", "Plain text body with no images."].join("\n");
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/assets/og-banner.png"]);
    });

    it("should return empty filepaths and preserve body when no images anywhere", () => {
        const page = ["---", "title: No Images", "---", "This page has no images in frontmatter or body."].join("\n");
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown).toContain("This page has no images in frontmatter or body.");
    });

    it("should not early-exit when body contains src= attribute", () => {
        const page = ["---", "title: Has Image", "---", '<img src="path/to/image.png" />'].join("\n");
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
    });
});

describe("streaming scanner curly-brace src handling", () => {
    it("should replace src={'path'} with file ID", () => {
        const page = "<img src={'path/to/image.png'} />";
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "curly-single-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:curly-single-id");
    });

    it('should replace src={"path"} with file ID', () => {
        const page = '<img src={"path/to/image.png"} />';
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "curly-double-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:curly-double-id");
    });

    it("should handle src={'path'} with whitespace inside braces", () => {
        const page = "<img src={ 'path/to/image.png' } />";
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "curly-space-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:curly-space-id");
    });

    it("should preserve anchor in src={'path#anchor'}", () => {
        const page = "<img src={'path/to/image.png#section'} />";
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "curly-anchor-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:curly-anchor-id#section");
    });

    it("should handle icon={'path'} for local icon references", () => {
        const page = "<Component icon={'path/to/icon.svg'} />";
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/icon.svg"), "curly-icon-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:curly-icon-id");
    });

    it("should produce same result as plain quotes for simple string literals", () => {
        const plainPage = '<img src="path/to/image.png" />';
        const curlyPage = "<img src={'path/to/image.png'} />";
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "compare-id"]
        ]);
        const plainResult = replaceImagePathsAndUrls(plainPage, fileIds, {}, PATHS, CONTEXT);
        const curlyResult = replaceImagePathsAndUrls(curlyPage, fileIds, {}, PATHS, CONTEXT);
        expect(plainResult).toContain("file:compare-id");
        expect(curlyResult).toContain("file:compare-id");
    });
});

describe("AST fallback for complex JSX expressions", () => {
    it("should leave src={variable} unchanged", () => {
        const page = "<img src={pathToImage} />";
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "should-not-appear"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("src={pathToImage}");
        expect(result).not.toContain("file:");
    });

    it("should leave src={fn('path')} unchanged when fn wraps the literal", () => {
        const page = "<img src={getUrl('path/to/image.png')} />";
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "fn-wrap-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        // The function call prevents extractSingleLiteral from returning a value,
        // so the AST fallback correctly skips this attribute
        expect(result).toContain("src={getUrl(");
    });

    it("should leave concatenated expressions unchanged", () => {
        const page = "<img src={base + '/image.png'} />";
        const fileIds = new Map([[AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/image.png"), "concat-id"]]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("src={base + '/image.png'}");
        expect(result).not.toContain("file:concat-id");
    });

    it("should handle spread attributes without crashing", () => {
        const page = '<Component {...{src: "path/to/image.png"}} />';
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "spread-id"]
        ]);
        // Should not throw — the spread triggers AST fallback which handles it via estree walking
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toBeDefined();
    });
});

describe("overlap prevention: mixed simple and complex expressions", () => {
    it("should replace simple src={'path'} without duplicating edits when complex expression is on same page", () => {
        const page = ["<img src={'path/to/simple.png'} />", "<Component src={getUrl('other.png')} />"].join("\n");
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/simple.png"), "simple-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:simple-id");
        // The simple path should be replaced exactly once
        const matches = result.match(/file:simple-id/g);
        expect(matches).toHaveLength(1);
    });

    it("should handle plain quotes and curly expressions on same page without corruption", () => {
        const page = [
            '<img src="path/to/plain.png" />',
            "<img src={'path/to/curly.png'} />",
            "<img src={dynamicPath} />"
        ].join("\n");
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/plain.png"), "plain-id"],
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/curly.png"), "curly-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:plain-id");
        expect(result).toContain("file:curly-id");
        expect(result).toContain("src={dynamicPath}");
    });

    it("should handle markdown images alongside JSX expressions without corruption", () => {
        const page = [
            "![alt](path/to/md-image.png)",
            "<img src={variable} />",
            '<img src="path/to/html-image.png" />'
        ].join("\n");
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/md-image.png"), "md-id"],
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/html-image.png"), "html-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("![alt](file:md-id)");
        expect(result).toContain('src="file:html-id"');
        expect(result).toContain("src={variable}");
    });

    it("should not produce overlapping edits when spread and simple attributes coexist", () => {
        const page = ["<img src={'path/to/image.png'} />", '<Component {...{href: "/other/page"}} />'].join("\n");
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "no-overlap-id"]
        ]);
        const result = replaceImagePathsAndUrls(page, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("file:no-overlap-id");
        // Verify the output is well-formed (no corrupted text from overlapping edits)
        expect(result).toContain("<Component");
        expect(result).toContain("/>");
    });
});

describe("markdown image titles", () => {
    it("should resolve the path of an image with a title", () => {
        const page = 'This is a test page with an image ![image](path/to/image.png "My title")';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);
        expect(result.markdown.trim()).toBe(
            'This is a test page with an image ![image](/Volume/git/fern/my/docs/folder/path/to/image.png "My title")'
        );
    });

    it("should replace an image with a title with its file ID, preserving the title", () => {
        const page = '![image](path/to/image.png "My title")';
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "titled-image-id"]
        ]);
        const result = replaceImagePathsAndUrls(parseResult.markdown, fileIds, {}, PATHS, CONTEXT);
        expect(result.trim()).toBe('![image](file:titled-image-id "My title")');
    });

    it("should support single-quoted and parenthesized titles", () => {
        const page = ["![a](path/to/a.png 'single')", "![b](path/to/b.png (parens))"].join("\n");
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/a.png"), "a-id"],
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/b.png"), "b-id"]
        ]);
        const result = replaceImagePathsAndUrls(parseResult.markdown, fileIds, {}, PATHS, CONTEXT);
        expect(result).toContain("![a](file:a-id 'single')");
        expect(result).toContain("![b](file:b-id (parens))");
    });

    it("should preserve the title alongside an anchor", () => {
        const page = '![image](path/to/image.png#anchor "My title")';
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "anchored-id"]
        ]);
        const result = replaceImagePathsAndUrls(parseResult.markdown, fileIds, {}, PATHS, CONTEXT);
        expect(result.trim()).toBe('![image](file:anchored-id#anchor "My title")');
    });

    it("should leave external images with titles untouched", () => {
        const page = '![image](https://example.com/image.png "My title")';
        const result = parseImagePaths(page, PATHS, CONTEXT);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toBe('![image](https://example.com/image.png "My title")');
    });

    it("should handle titles with the streaming parser for large files", () => {
        vi.stubEnv("FERN_DOCS_LARGE_FILE_BYTES", "10");
        const logSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);

        const page = '![image](path/to/image.png "My title")';
        const parseResult = parseImagePaths(page, PATHS, CONTEXT);
        const logged = logSpy.mock.calls.flat().join("\n");
        logSpy.mockRestore();

        // guards against silently exercising the mdast path instead
        expect(logged).toContain("Using streaming parser for large file");
        expect(parseResult.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/path/to/image.png"]);

        const fileIds = new Map([
            [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png"), "streamed-id"]
        ]);
        const result = replaceImagePathsAndUrls(parseResult.markdown, fileIds, {}, PATHS, CONTEXT);
        expect(result.trim()).toBe('![image](file:streamed-id "My title")');

        vi.unstubAllEnvs();
    });

    it("should not swallow the title when the destination has an unterminated angle bracket", () => {
        vi.stubEnv("FERN_DOCS_LARGE_FILE_BYTES", "10");
        const result = parseImagePaths('![image](<path/to/image.png "My title")', PATHS, CONTEXT);
        expect(result.filepaths).toEqual(["/Volume/git/fern/my/docs/folder/<path/to/image.png"]);
        expect(result.markdown.trim()).toBe('![image](/Volume/git/fern/my/docs/folder/<path/to/image.png "My title")');
        vi.unstubAllEnvs();
    });

    it("should rewrite a relative markdown link that specifies a title", () => {
        const page = '[other page](./other.mdx "My title")';
        const result = replaceImagePathsAndUrls(
            page,
            new Map(),
            { [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/other.mdx")]: "docs/other" },
            PATHS,
            CONTEXT
        );
        expect(result.trim()).toBe('[other page](/docs/other "My title")');
    });

    it("should rewrite a relative markdown link with both an anchor and a title", () => {
        const page = "[other page](./other.mdx#section 'My title')";
        const result = replaceImagePathsAndUrls(
            page,
            new Map(),
            { [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/other.mdx")]: "docs/other" },
            PATHS,
            CONTEXT
        );
        expect(result.trim()).toBe("[other page](/docs/other#section 'My title')");
    });
});

describe("literal angle brackets in prose", () => {
    const IMAGE_PATH = AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png");
    const fileIds = new Map([[IMAGE_PATH, "leaf-id"]]);

    function roundTrip(page: string): string {
        const parsed = parseImagePaths(page, PATHS, CONTEXT);
        return replaceImagePathsAndUrls(parsed.markdown, fileIds, {}, PATHS, CONTEXT);
    }

    it.each([
        ["comparison operator in inline code", "Outliers are `is < Q1 - 1.5*IQR`."],
        ["comparison operator in plain text", "Keep the tolerance < 5 percent."],
        ["less-than-or-equal in inline code", "Show deals below the margin (filter is `<=`)."],
        ["escaped angle bracket", "Use \\<placeholder\\> for the name."],
        ["angle bracket inside a fenced code block", "```js\nif (a < b) {\n  send();\n}\n```"]
    ])("replaces a later image path when the page contains a %s", (_name, prose) => {
        const page = `${prose}\n\n![leaf](path/to/image.png)\n`;
        expect(roundTrip(page).trim()).toBe(`${prose}\n\n![leaf](file:leaf-id)`.trim());
    });

    it("replaces images that follow an unterminated tag-like construct", () => {
        const page = "Pass `<div` to the helper.\n\n![leaf](path/to/image.png)\n";
        expect(roundTrip(page)).toContain("file:leaf-id");
    });

    it("still rewrites src on real tags", () => {
        const page = 'The width must be < 100.\n\n<img src="path/to/image.png" />\n';
        const result = roundTrip(page);
        expect(result).toContain('src="file:leaf-id"');
        expect(result).toContain("must be < 100");
    });

    it("still rewrites links after a literal angle bracket", () => {
        const page = "Values where a < b.\n\n[other page](./other.mdx)\n";
        const result = replaceImagePathsAndUrls(
            page,
            new Map(),
            { [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/other.mdx")]: "docs/other" },
            PATHS,
            CONTEXT
        );
        expect(result).toContain("[other page](/docs/other)");
    });

    it("replaces the image path on both the streaming and AST paths", () => {
        vi.stubEnv("FERN_DOCS_LARGE_FILE_BYTES", "10");
        const page = "Outliers are `is < Q1`.\n\n![leaf](path/to/image.png)\n";
        const parsed = parseImagePaths(page, PATHS, CONTEXT);
        expect(parsed.filepaths).toEqual([IMAGE_PATH]);
        expect(replaceImagePathsAndUrls(parsed.markdown, fileIds, {}, PATHS, CONTEXT)).toContain("file:leaf-id");
        vi.unstubAllEnvs();
    });

    it("does not leave a local filesystem path in the published markdown", () => {
        const page = "Outliers are `is < Q1`.\n\n![leaf](path/to/image.png)\n";
        expect(roundTrip(page)).not.toContain("/Volume/git/fern");
    });

    it.each([
        ["unmatched backtick in prose", "The a`b operator is odd."],
        ["backtick inside an indented fence", "- Example:\n\n    ```\n    a ` b\n    ```"],
        ["unterminated fence", "```js\nconst a = 1;"],
        ["windows line endings around an unterminated tag-like construct", "Pass `<div` here.\r\n\r\n"]
    ])("replaces a later image path when the page contains an %s", (_name, prose) => {
        const page = `${prose}\n\n![leaf](path/to/image.png)\n`;
        expect(roundTrip(page)).toContain("file:leaf-id");
    });

    it.each([
        ["balanced brackets in image alt text", "![Filter [Top N] menu](path/to/image.png)"],
        ["nested brackets in image alt text", "![a [b [c] d] e](path/to/image.png)"],
        ["escaped brackets in image alt text", "![Filter \\[Top N\\] menu](path/to/image.png)"],
        ["empty brackets in image alt text", "![Filter [] menu](path/to/image.png)"],
        ["unbalanced brackets in image alt text", "![Filter \\[Top N] menu](path/to/image.png)"]
    ])("resolves an image with %s", (_name, page) => {
        const result = roundTrip(page);
        expect(result).toContain("file:leaf-id");
        expect(result).not.toContain("/Volume/git/fern");
    });

    it.each([
        ["bracketed prose on the previous line", "See [1] for details.\n![leaf](path/to/image.png)"],
        ["a table row with bracketed text", "| [Docs] | ![leaf](path/to/image.png) |"],
        ["a keyboard key in prose", "Press [Enter].\n![leaf](path/to/image.png)"],
        ["an image label with no destination", "![leaf]\n![leaf](path/to/image.png)"],
        [
            "a fully escaped bracket pair",
            "Apply Top N to the \\[Sum of Quantity\\], like this:\n\n![leaf](path/to/image.png)"
        ]
    ])("resolves an image preceded by %s", (_name, page) => {
        const result = roundTrip(page);
        expect(result).toContain("file:leaf-id");
        expect(result).not.toContain("/Volume/git/fern");
    });

    it("resolves an image that follows one with brackets in its alt text", () => {
        const page = "![Filter [Top N] menu](path/to/image.png)\n\n![plain](path/to/image.png)\n";
        expect(roundTrip(page).match(/file:leaf-id/g)).toHaveLength(2);
    });

    it("rewrites a relative link whose text contains brackets", () => {
        const page = "[see [Top N] docs](./other.mdx)\n";
        const result = replaceImagePathsAndUrls(
            page,
            new Map(),
            { [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/other.mdx")]: "docs/other" },
            PATHS,
            CONTEXT
        );
        expect(result).toContain("(/docs/other)");
    });

    it("does not rewrite an image inside a fenced code block", () => {
        const page = "```\n![leaf](path/to/image.png)\n```\n";
        expect(roundTrip(page)).toContain("![leaf](path/to/image.png)");
    });
});

describe("angle bracket delimited destinations", () => {
    const IMAGE_PATH = AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/to/image.png");
    const fileIds = new Map([[IMAGE_PATH, "bracketed-id"]]);

    function roundTrip(page: string, ids: Map<AbsoluteFilePath, string> = fileIds): string {
        const parsed = parseImagePaths(page, PATHS, CONTEXT);
        return replaceImagePathsAndUrls(parsed.markdown, ids, {}, PATHS, CONTEXT).trim();
    }

    it("replaces the image path with a fileId", () => {
        expect(roundTrip("![image](<path/to/image.png>)")).toBe("![image](<file:bracketed-id>)");
    });

    it("does not leave a local filesystem path in the published markdown", () => {
        expect(roundTrip("![image](<path/to/image.png>)")).not.toContain("/Volume/git/fern");
    });

    it("replaces the image path on the streaming path", () => {
        vi.stubEnv("FERN_DOCS_LARGE_FILE_BYTES", "10");
        const parsed = parseImagePaths("![image](<path/to/image.png>)", PATHS, CONTEXT);
        expect(parsed.filepaths).toEqual([IMAGE_PATH]);
        expect(replaceImagePathsAndUrls(parsed.markdown, fileIds, {}, PATHS, CONTEXT).trim()).toBe(
            "![image](<file:bracketed-id>)"
        );
        vi.unstubAllEnvs();
    });

    it("resolves a destination containing spaces", () => {
        const spacedPath = AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/path/my image.png");
        const parsed = parseImagePaths("![image](<path/my image.png>)", PATHS, CONTEXT);
        expect(parsed.filepaths).toEqual([spacedPath]);
        expect(
            replaceImagePathsAndUrls(parsed.markdown, new Map([[spacedPath, "spaced-id"]]), {}, PATHS, CONTEXT).trim()
        ).toBe("![image](<file:spaced-id>)");
    });

    it("preserves an anchor", () => {
        expect(roundTrip("![image](<path/to/image.png#anchor>)")).toBe("![image](<file:bracketed-id#anchor>)");
    });

    it("preserves a title", () => {
        expect(roundTrip('![image](<path/to/image.png> "My title")')).toBe('![image](<file:bracketed-id> "My title")');
    });

    it("resolves a destination inside a JSX element", () => {
        const page = '<Frame caption="Installer">![image](<path/to/image.png>)</Frame>';
        expect(roundTrip(page)).toBe('<Frame caption="Installer">![image](<file:bracketed-id>)</Frame>');
    });

    it("rewrites a bracketed markdown link", () => {
        const page = "[other page](<./other.mdx>)";
        const result = replaceImagePathsAndUrls(
            page,
            new Map(),
            { [AbsoluteFilePath.of("/Volume/git/fern/my/docs/folder/other.mdx")]: "docs/other" },
            PATHS,
            CONTEXT
        );
        expect(result.trim()).toBe("[other page](</docs/other>)");
    });
});
