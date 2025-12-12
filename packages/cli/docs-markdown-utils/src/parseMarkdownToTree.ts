import grayMatter from "gray-matter";
import type { Root as MdastRoot } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";

interface MdxParseError extends Error {
    line?: number;
    column?: number;
    place?: {
        line?: number;
        column?: number;
        offset?: number;
    };
    position?: {
        start?: { line?: number; column?: number; offset?: number };
        end?: { line?: number; column?: number; offset?: number };
    };
    reason?: string;
    ruleId?: string;
    source?: string;
}

function formatMdxError(error: MdxParseError, frontmatterLineCount: number): string {
    const reason = error.reason ?? error.message;

    let line: number | undefined;
    let column: number | undefined;

    if (error.line != null) {
        line = error.line;
        column = error.column;
    } else if (error.place?.line != null) {
        line = error.place.line;
        column = error.place.column;
    } else if (error.position?.start?.line != null) {
        line = error.position.start.line;
        column = error.position.start.column;
    }

    if (line != null) {
        const adjustedLine = line + frontmatterLineCount;
        const location = column != null ? `line ${adjustedLine}, column ${column}` : `line ${adjustedLine}`;
        return `${reason} (at ${location})`;
    }

    return reason;
}

export function parseMarkdownToTree(markdown: string): MdastRoot {
    const { content, matter } = grayMatter(markdown);
    const frontmatterLineCount = matter ? matter.split("\n").length + 2 : 0;

    try {
        return fromMarkdown(content, {
            extensions: [mdxjs(), gfm(), math()],
            mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()]
        });
    } catch (error) {
        if (error instanceof Error) {
            const mdxError = error as MdxParseError;
            const formattedMessage = formatMdxError(mdxError, frontmatterLineCount);
            const enhancedError = new Error(formattedMessage);
            enhancedError.stack = error.stack;
            throw enhancedError;
        }
        throw error;
    }
}
