/**
 * A markdown link extracted from an `llms.txt` file.
 */
export interface ExtractedLink {
    text: string;
    url: string;
}

const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g;

/**
 * Extract markdown links (`[text](url)`) from an `llms.txt` file's contents.
 *
 * This mirrors the link extraction used by external `llms.txt` validators so
 * that `fern check` and those tools agree on what counts as a link.
 */
export function extractMarkdownLinks(content: string): ExtractedLink[] {
    const links: ExtractedLink[] = [];
    let match: RegExpExecArray | null;
    MARKDOWN_LINK_REGEX.lastIndex = 0;
    while ((match = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
        const text = match[1];
        const url = match[2];
        if (text != null && url != null) {
            links.push({ text, url });
        }
    }
    return links;
}
