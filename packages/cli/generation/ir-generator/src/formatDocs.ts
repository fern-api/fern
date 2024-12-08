export function formatDocs(docs: string | undefined): string | undefined {
    if (docs == null) {
        return undefined;
    }
    const formattedDocs = docs;
    if (formattedDocs.endsWith("\n") || formattedDocs.endsWith("\r")) {
        return formattedDocs.substring(0, formattedDocs.length - 1);
    }
    return formattedDocs;
}
