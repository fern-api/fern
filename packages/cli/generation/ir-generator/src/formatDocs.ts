import * as prettier from "prettier";

export async function formatDocs(docs: string | undefined): Promise<string | undefined> {
    if (docs != null) {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const formattedDocs = await prettier.format(docs, {
            parser: "markdown"
        });
        const formattedDocsWoNewline = formattedDocs.replace(/[\r\n]+$/, "");
        return formattedDocsWoNewline;
    }
    return docs;
}
