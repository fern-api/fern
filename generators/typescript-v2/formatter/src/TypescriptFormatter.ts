import { AbstractFormatter } from "@fern-api/base-generator";

export class TypescriptFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return content;
    }

    public formatSync(content: string): string {
        return content;
    }
}
