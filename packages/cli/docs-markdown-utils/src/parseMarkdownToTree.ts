import grayMatter from "gray-matter";
import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";

export function parseMarkdownToTree(markdown: string): MdastRoot {
    const { content } = grayMatter(markdown);
    return fromMarkdown(content, {
        extensions: [mdxjs(), gfm(), math()],
        mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()]
    });
}
