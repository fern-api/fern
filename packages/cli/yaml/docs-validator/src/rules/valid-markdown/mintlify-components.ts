import { isMdxJsxElement, parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import { visit } from "unist-util-visit";

/**
 * Mintlify-only components that Fern renders through a Fern equivalent. Using the Fern component directly
 * keeps the page portable across renderer versions.
 */
const MINTLIFY_COMPONENT_REPLACEMENTS: Record<string, string> = {
    ResponseField: '<ParamField path="...">'
};

export function getMintlifyComponentWarnings(content: string): string[] {
    const names = Object.keys(MINTLIFY_COMPONENT_REPLACEMENTS).filter((name) => content.includes(`<${name}`));
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
        return [];
    }

    return [...counts.entries()].map(([name, count]) => {
        const replacement = MINTLIFY_COMPONENT_REPLACEMENTS[name] ?? "a Fern component";
        const occurrences = count === 1 ? "1 occurrence" : `${count} occurrences`;
        return `<${name}> is a Mintlify component, not a Fern component (${occurrences}). Use ${replacement} instead; <${name} name="..."> is rendered as a ParamField alias.`;
    });
}
