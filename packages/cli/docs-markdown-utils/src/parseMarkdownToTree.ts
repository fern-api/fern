import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";
import { gfm } from "micromark-extension-gfm";
import { UnreachableCaseError } from "ts-essentials";
import grayMatter from "gray-matter";

export function parseMarkdownToTree(markdown: string, format: "mdx" | "md" = "mdx"): MdastRoot {
    const { content } = grayMatter(markdown);
    if (format === "md") {
        return fromMarkdown(content, {
            extensions: [gfm(), math()],
            mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()]
        });
    } else if (format === "mdx") {
        return fromMarkdown(content, {
            extensions: [mdxjs(), gfm(), math()],
            mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()]
        });
    } else {
        throw new UnreachableCaseError(format);
    }
}
