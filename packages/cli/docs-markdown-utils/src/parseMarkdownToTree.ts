import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";
import { gfm } from "micromark-extension-gfm";
import { UnreachableCaseError } from "ts-essentials";

export function parseMarkdownToTree(content: string, format: "mdx" | "md" = "mdx"): MdastRoot {
    if (format === "md") {
        return fromMarkdown(content, {
            extensions: [gfm(), math()],
            mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()]
        });
    } else if (format === "mdx") {
        return fromMarkdown(content, {
            extensions: [gfm(), mdxjs(), math()],
            mdastExtensions: [gfmFromMarkdown(), mdxFromMarkdown(), mathFromMarkdown()]
        });
    } else {
        throw new UnreachableCaseError(format);
    }
}
