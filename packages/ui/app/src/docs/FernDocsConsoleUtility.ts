// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).FernDocs = {
    setDomain: (domain: string) => FERN_DOCS_CONSOLE_UTILITY.setDomain(domain),
};

export class FernDocsConsoleUtility {
    private listeners: ((domain: string) => void)[] = [];

    public setDomain(domain: string): void {
        for (const listener of this.listeners) {
            listener(domain);
        }
    }

    public addListener(listener: (domain: string) => void): () => void {
        this.listeners.push(listener);

        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
}

export const FERN_DOCS_CONSOLE_UTILITY = new FernDocsConsoleUtility();
