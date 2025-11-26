/* eslint-disable jest/expect-expect */

import { AbsoluteFilePath, relative } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { diffLines } from "diff";
import fs from "fs";
import { resolve } from "path";
import { afterEach, beforeEach } from "vitest";

import { parseImagePaths, replaceImagePathsAndUrls } from "../parseImagePaths";

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
        expect(result.markdown.trim()).toEqual("---\nimage:\n  type: url\n  value: 'https://someurl.com'\n---");
    });

    it("should parse url from frontmatter yaml", () => {
        const page = '---\nimage:\n  type: url\n  value: "https://someurl.com"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toEqual("---\nimage:\n  type: url\n  value: 'https://someurl.com'\n---");
    });

    it("should parse url from frontmatter text", () => {
        const page = '---\nimage: "https://someurl.com"\n---';
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toEqual("---\nimage:\n  type: url\n  value: 'https://someurl.com'\n---");
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
            "---\n'og:image':\n  type: fileId\n  value: /Volume/git/fern/my/docs/folder/path/to/image.png\n---"
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
            value: 'https://someurl.com'
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

    it("should ignore protocol-relative urls with valid hosts", () => {
        const page = "This is a test page with an image ![image](//cdn.example.com/image.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](//cdn.example.com/image.png)"'
        );
    });

    it("should ignore protocol-relative urls with localhost", () => {
        const page = "This is a test page with an image ![image](//localhost:3000/image.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual([]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](//localhost:3000/image.png)"'
        );
    });

    it("should treat double-slash paths without valid hosts as local paths", () => {
        const page = "This is a test page with an image ![image](//assets/images/logo.png)";
        const result = parseImagePaths(page, PATHS);
        expect(result.filepaths).toEqual(["/Volume/git/fern/assets/images/logo.png"]);
        expect(result.markdown.trim()).toMatchInlineSnapshot(
            '"This is a test page with an image ![image](/Volume/git/fern/assets/images/logo.png)"'
        );
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
});
