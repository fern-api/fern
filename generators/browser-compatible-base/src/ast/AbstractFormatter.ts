export abstract class AbstractFormatter {
    abstract format(content: string): Promise<string>;
}

export class NopFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return content;
    }
}
