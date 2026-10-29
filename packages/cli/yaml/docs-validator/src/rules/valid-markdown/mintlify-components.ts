import { isMdxJsxElement, parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import { visit } from "unist-util-visit";

/**
 * Mintlify-only components that Fern renders through a Fern equivalent. Using the Fern component directly
 * keeps the page portable across renderer versions.
 */
const MINTLIFY_COMPONENT_HINTS: Record<string, string> = {
    ResponseField: 'Use <ParamField path="..."> instead; <ResponseField name="..."> is rendered as a ParamField alias.',
    Danger: "Use <Error> instead; <Danger> is rendered as an Error callout.",
    Columns: "Use <CardGroup cols={...}> instead; <Columns> is rendered as a CardGroup.",
    Tree: "Use <Files>, <Folder> and <File> instead; <Tree> is rendered as Files.",
    FileTree: "Use <Files>, <Folder> and <File> instead; <FileTree> is rendered as Files.",
    RequestExample: "Use <CodeGroup> instead; <RequestExample> is rendered inline as a CodeGroup.",
    ResponseExample: "Use <CodeGroup> instead; <ResponseExample> is rendered inline as a CodeGroup.",
    Visibility:
        'Use <llms-ignore> or <llms-only> instead; <Visibility for="humans|agents"> is rendered as those, and other `for` values are not supported.'
};

export function getMintlifyComponentWarnings(content: string): string[] {
    const names = Object.keys(MINTLIFY_COMPONENT_HINTS).filter((name) => content.includes(`<${name}`));
    if (names.length === 0) {
        return [];
    }

    const counts = new Map<string, number>();
    try {
        visit(parseMarkdownToTree(content), (node) => {
            if (isMdxJsxElement(node) && node.name != null && names.includes(node.name)) {
                counts.set(node.name, (counts.get(node.name) ?? 0) + 1);
            }
        });
    } catch {
        // Fall back to a raw-text count so a parser mismatch doesn't hide the warning.
        for (const name of names) {
            counts.set(name, content.match(new RegExp(`<${name}\\b`, "g"))?.length ?? 0);
        }
    }

    return [...counts.entries()]
        .filter(([, count]) => count > 0)
        .map(([name, count]) => {
            const hint = MINTLIFY_COMPONENT_HINTS[name] ?? "Use a Fern component instead.";
            const occurrences = count === 1 ? "1 occurrence" : `${count} occurrences`;
            return `<${name}> is a Mintlify component, not a Fern component (${occurrences}). ${hint}`;
        });
}
