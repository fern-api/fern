import { DocsFormatter } from "./DocsFormatter";

export class NopFormatter implements DocsFormatter {
    public async format(docs: string): Promise<string> {
        return docs;
    }
}

