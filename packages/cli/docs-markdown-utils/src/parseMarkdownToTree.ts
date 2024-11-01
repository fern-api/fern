import { fromMarkdown } from "mdast-util-from-markdown";
// Hotfix:  ../docs-markdown-utils/src/parseMarkdownToTree.ts(2,10): error TS2459: Module '"mdast-util-from-markdown/lib"' declares 'Root' locally, but it is not exported.
// import { Root } from "mdast-util-from-markdown/lib";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { mdx } from "micromark-extension-mdx";

export function parseMarkdownToTree(content: string): any {
    return fromMarkdown(content, {
        extensions: [mdx()],
        mdastExtensions: [mdxFromMarkdown()]
    });
}
