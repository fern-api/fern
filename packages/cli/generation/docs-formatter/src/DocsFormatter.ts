export abstract class DocsFormatter {
    public abstract format(docs: string): Promise<string>;
}
