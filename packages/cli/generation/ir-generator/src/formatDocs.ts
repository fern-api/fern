export function formatDocs(docs: string | undefined): string | undefined {
    if (docs == null) {
        return undefined;
    }
    if (docs.endsWith("\n") || docs.endsWith("\r")) {
        return docs.substring(0, docs.length - 1);
    }
    return docs;
}
