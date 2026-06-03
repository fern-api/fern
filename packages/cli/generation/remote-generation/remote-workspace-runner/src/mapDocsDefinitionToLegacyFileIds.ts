import type { DocsV1Write } from "@fern-api/fdr-sdk";

type DocsDefinition = DocsV1Write.DocsDefinition;

const FILE_REF_PATTERN = /file:([^\s"'<>)}\]]+)/g;

function remapString(value: string, pathToFileId: Map<string, string>): string {
    const exactMatch = pathToFileId.get(value);
    if (exactMatch != null) {
        return exactMatch;
    }
    return value.replace(FILE_REF_PATTERN, (token, path: string) => `file:${pathToFileId.get(path) ?? path}`);
}

function remapValue(value: unknown, pathToFileId: Map<string, string>): unknown {
    if (typeof value === "string") {
        return remapString(value, pathToFileId);
    }
    if (Array.isArray(value)) {
        return value.map((item) => remapValue(item, pathToFileId));
    }
    if (value != null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remapValue(item, pathToFileId)]));
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
    return remapValue(docsDefinition, pathToFileId) as DocsDefinition;
}
