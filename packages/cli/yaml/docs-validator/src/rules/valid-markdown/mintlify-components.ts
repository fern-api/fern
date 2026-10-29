import { isMdxJsxElement, parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import { visit } from "unist-util-visit";

/**
 * Mintlify-only components that Fern renders through a Fern equivalent. Using the Fern component directly
 * keeps the page portable across renderer versions.
 */
const MINTLIFY_COMPONENT_HINTS: Record<string, string> = {
    ResponseField: 'Use <ParamField path="..."> instead; <ResponseField name="..."> is rendered as a ParamField alias.'
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
