const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

export async function formatAllDocs(definition: Record<string, any>): Promise<void> {
    for (const key of Object.keys(definition)) {
        const value = definition[key];
        if (key === "docs" && typeof value === "string") {
            definition[key] = await formatDocs(value);
            continue;
        }
        if (value != null && typeof value === "object") {
            await formatAllDocs(value);
        }
    }
}

async function formatDocs(docs: string | undefined): Promise<string | undefined> {
    if (docs == null || isBrowser) {
        return undefined;
    }
    const prettier = await import("prettier");
    const formattedDocs = prettier.format(docs, {
        parser: "markdown"
    });
    if (formattedDocs.endsWith("\n") || formattedDocs.endsWith("\r")) {
        return formattedDocs.substring(0, formattedDocs.length - 1);
    }
    return formattedDocs;
}
