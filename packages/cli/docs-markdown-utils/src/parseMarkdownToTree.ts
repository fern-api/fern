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

    // Check if the content contains autolinks that might conflict with MDX parsing
    const hasAutolinks = /<https?:\/\/[^>]+>/.test(content);

    if (hasAutolinks) {
        // Use basic markdown parsing without MDX for content with autolinks
        return fromMarkdown(content, {
            extensions: [gfm(), math()],
            mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()]
        });
    }

    // Use full MDX parsing for content without autolinks
    return fromMarkdown(content, {
        extensions: [mdxjs(), gfm(), math()],
        mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()]
    });
}
