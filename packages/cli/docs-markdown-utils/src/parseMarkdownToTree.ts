import grayMatter from "gray-matter";
import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";

// HTML void elements that are self-closing by definition in HTML5 but require
// explicit self-closing syntax (<br />) in JSX/MDX. The MDX parser (mdxjs)
// treats `<br>` as an opening tag and fails when it encounters a mismatched
// closing tag. This regex normalizes them to XHTML-compatible self-closing form.
const VOID_ELEMENTS = /(<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b)([^>]*?)\/?\s*>/gi;

export function selfCloseVoidHtmlElements(content: string): string {
    return content.replace(VOID_ELEMENTS, (_match, tag: string, attrs: string) => `${tag}${attrs.trimEnd()} />`);
}

export function parseMarkdownToTree(markdown: string): MdastRoot {
    const { content } = grayMatter(markdown);
    return fromMarkdown(selfCloseVoidHtmlElements(content), {
        extensions: [mdxjs(), gfm(), math()],
        mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()]
    });
}
