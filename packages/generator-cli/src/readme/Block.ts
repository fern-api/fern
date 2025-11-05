import type { Writer } from "../utils/Writer";

export class Block {
    public id: string;
    public content: string;

    constructor({ id, content }: { id: string; content: string }) {
        this.id = id;
        this.content = content;
    }

    public async write(writer: Writer): Promise<void> {
        await writer.write(this.content);
        if (!this.content.endsWith("\n")) {
            await writer.writeLine();
        }
    }
}
