export abstract class AbstractFormatter {
    public abstract format(content: string): Promise<string>;
    public abstract formatSync(content: string): string;
    public formatMultiple(contents: string[]): Promise<string[]> {
        return Promise.all(contents.map((content) => this.format(content)));
    }
    public formatMultipleSync(contents: string[]): string[] {
        return contents.map((content) => this.formatSync(content));
    }
}

export class NopFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return content;
    }

    public formatSync(content: string): string {
        return content;
    }
}
