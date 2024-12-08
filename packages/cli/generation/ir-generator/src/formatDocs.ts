const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

export  function formatDocs(docs: string | undefined): string | undefined {
    if (docs == null || isBrowser) {
        return undefined;
    }
    const prettier =  import("prettier");
    const formattedDocs = prettier.format(docs, {
        parser: "markdown"
    });
    if (formattedDocs.endsWith("\n") || formattedDocs.endsWith("\r")) {
        return formattedDocs.substring(0, formattedDocs.length - 1);
    }
    return formattedDocs;
}
