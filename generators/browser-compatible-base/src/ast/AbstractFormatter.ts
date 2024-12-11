export abstract class AbstractFormatter {
    abstract format(content: string): Promise<string>;
    abstract formatSync(content: string): string;
}

export class NopFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return content;
    }

    public formatSync(content: string): string {
        return content;
    }
}
