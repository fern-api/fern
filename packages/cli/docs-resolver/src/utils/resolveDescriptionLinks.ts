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
 * Resolves .mdx/.md file path links in all string values within an object.
 *
 * Uses JSON.parse with a reviver to transform matching strings during deserialization.
 * This is significantly faster than recursive JavaScript object traversal for large objects
 * (e.g. IR objects with tens of thousands of nodes) because V8's JSON implementation is in C++
 * and avoids the overhead of JavaScript property enumeration and function calls per node.
 *
 * Returns a new object with resolved links (does not mutate the input).
 */
export function resolveLinksInObject<T>(
    obj: T,
    markdownFilesToPathName: Record<AbsoluteFilePath, string>,
    metadata: AbsolutePathMetadata
): T {
    if (obj == null || typeof obj !== "object") {
        return obj;
    }

    // Serialize using native JSON.stringify (C++ implementation, very fast for large objects)
    const serialized = JSON.stringify(obj);

    // Fast path: if no .md references exist anywhere in the serialized object, skip processing entirely
    if (!serialized.includes(".md")) {
        return obj;
    }

    // Parse with a reviver that transforms matching strings during deserialization.
    // The reviver is called for every value; for strings containing ".md", we apply
    // the markdown link resolution regex. Non-matching values pass through unchanged.
    return JSON.parse(serialized, (_key, value) => {
        if (typeof value === "string" && value.includes(".md")) {
            return resolveLinksInMarkdownString(value, markdownFilesToPathName, metadata);
        }
        return value;
    });
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
