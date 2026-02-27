import { getReplacedHref } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

export interface AbsolutePathMetadata {
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToMarkdownFile: AbsoluteFilePath;
}

/**
 * Resolves .mdx/.md file path links in a markdown string to URL slugs.
 * For example, converts [Order](/docs/pages/objects/Order.mdx) to [Order](/objects/order).
 */
export function resolveLinksInMarkdownString(
    markdown: string,
    markdownFilesToPathName: Record<AbsoluteFilePath, string>,
    metadata: AbsolutePathMetadata
): string {
    // Match markdown links ending in .md or .mdx, optionally with an anchor fragment
    return markdown.replace(/\[([^\]]*)\]\(([^)]+\.mdx?(?:#[^)]*)?)\)/g, (match, text, fullHref) => {
        const hashIndex = fullHref.indexOf("#");
        const href = hashIndex >= 0 ? fullHref.substring(0, hashIndex) : fullHref;
        const anchor = hashIndex >= 0 ? fullHref.substring(hashIndex) : "";

        const replaced = getReplacedHref({ href, metadata, markdownFilesToPathName });
        if (replaced != null && replaced.type === "replace") {
            return `[${text}](${replaced.slug}${anchor})`;
        }
        return match;
    });
}

/**
 * Recursively walks an object and resolves .mdx/.md file path links in all string values.
 * Rather than matching on a specific key name, this checks every string for markdown links
 * containing .mdx/.md extensions — the regex in resolveLinksInMarkdownString is the real filter.
 */
export function resolveLinksInObject(
    obj: unknown,
    markdownFilesToPathName: Record<AbsoluteFilePath, string>,
    metadata: AbsolutePathMetadata
): void {
    if (obj == null || typeof obj !== "object") {
        return;
    }
    if (Array.isArray(obj)) {
        for (const item of obj) {
            resolveLinksInObject(item, markdownFilesToPathName, metadata);
        }
        return;
    }
    const record = obj as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
        if (typeof value === "string" && value.includes(".md")) {
            record[key] = resolveLinksInMarkdownString(value, markdownFilesToPathName, metadata);
        } else if (typeof value === "object") {
            resolveLinksInObject(value, markdownFilesToPathName, metadata);
        }
    }
}

/**
 * Recursively walks a navigation node tree and replaces all occurrences of
 * oldApiDefinitionId with newApiDefinitionId.
 */
export function updateApiDefinitionIdInTree(node: unknown, oldId: string, newId: string): void {
    if (node == null || typeof node !== "object") {
        return;
    }
    if (Array.isArray(node)) {
        for (const item of node) {
            updateApiDefinitionIdInTree(item, oldId, newId);
        }
        return;
    }
    const record = node as Record<string, unknown>;
    if (record["apiDefinitionId"] === oldId) {
        record["apiDefinitionId"] = newId;
    }
    for (const value of Object.values(record)) {
        if (typeof value === "object") {
            updateApiDefinitionIdInTree(value, oldId, newId);
        }
    }
}
