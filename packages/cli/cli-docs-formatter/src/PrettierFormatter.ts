import { DocsFormatter } from "@fern-api/cli-docs-formatter";
import prettier from "prettier";

export class PrettierFormatter implements DocsFormatter {
    public async format(docs: string): Promise<string> {
        const formattedDocs = prettier.format(docs, {
            parser: "markdown"
        });
        if (formattedDocs.endsWith("\n") || formattedDocs.endsWith("\r")) {
            return formattedDocs.substring(0, formattedDocs.length - 1);
        }
        return formattedDocs;
    }
}

