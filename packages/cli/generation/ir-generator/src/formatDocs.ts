export function formatDocs(docs: string | undefined): string | undefined {
    if (docs == null) {
        return undefined;
    }
    // Replace */ with * / to prevent comment closure.
    docs = docs.replace(/\*\//g, "* /");
    if (docs.endsWith("\n") || docs.endsWith("\r")) {
        return docs.substring(0, docs.length - 1);
    }
    return docs;
}
