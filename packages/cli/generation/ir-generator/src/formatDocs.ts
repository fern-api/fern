const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

export function formatDocs(docs: string | undefined): string | undefined {
    if (docs == null || isBrowser) {
        return undefined;
    }
    // TODO: Find a way to support this in the browser without an async conditional import.
    //
    // const prettier = import("prettier");
    // const formattedDocs = prettier.format(docs, {
    //     parser: "markdown"
    // });
    const formattedDocs = docs;
    if (formattedDocs.endsWith("\n") || formattedDocs.endsWith("\r")) {
        return formattedDocs.substring(0, formattedDocs.length - 1);
    }
    return formattedDocs;
}
