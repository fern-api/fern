import grayMatter from "gray-matter";
import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";

/**
 * Parses markdown that has already had its frontmatter stripped. Node offsets are relative to
 * `body`, which makes this the right entrypoint when offsets need to be mapped back onto the
 * original file.
 */
export function parseMarkdownBodyToTree(body: string): MdastRoot {
    return fromMarkdown(body, {
        extensions: [mdxjs(), gfm(), math()],
        mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()]
    });
}

export function parseMarkdownToTree(markdown: string): MdastRoot {
    const { content } = grayMatter(markdown);
    return parseMarkdownBodyToTree(content);
}
