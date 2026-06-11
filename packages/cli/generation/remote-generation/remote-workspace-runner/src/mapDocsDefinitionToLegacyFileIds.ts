import type { DocsV1Write } from "@fern-api/fdr-sdk";

type DocsDefinition = DocsV1Write.DocsDefinition;

function remapString(value: string, sortedPaths: string[], pathToFileId: Map<string, string>): string {
    const exactMatch = pathToFileId.get(value);
    if (exactMatch != null) {
        return exactMatch;
    }
    let result = value;
    for (const path of sortedPaths) {
        const fileRef = `file:${path}`;
        if (!result.includes(fileRef)) {
            continue;
        }
        const fileId = pathToFileId.get(path);
        if (fileId != null) {
            result = result.split(fileRef).join(`file:${fileId}`);
        }
    }
    return result;
}

function remapValue(value: unknown, sortedPaths: string[], pathToFileId: Map<string, string>): unknown {
    if (typeof value === "string") {
        return remapString(value, sortedPaths, pathToFileId);
    }
    if (Array.isArray(value)) {
        return value.map((item) => remapValue(item, sortedPaths, pathToFileId));
    }
    if (value != null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, remapValue(item, sortedPaths, pathToFileId)])
        );
    }
    return value;
}

export function mapDocsDefinitionToLegacyFileIds({
    docsDefinition,
    pathToFileId
}: {
    docsDefinition: DocsDefinition;
    pathToFileId: Map<string, string> | undefined;
}): DocsDefinition {
    if (pathToFileId == null || pathToFileId.size === 0) {
        return docsDefinition;
    }
    const sortedPaths = [...pathToFileId.keys()].sort((a, b) => b.length - a.length);
    return remapValue(docsDefinition, sortedPaths, pathToFileId) as DocsDefinition;
}
