import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Array_ {
    interface Args {
        entries: AstNode[] | undefined;
    }
}

export class Array_ extends AstNode {
    private entries: AstNode[];

    constructor({ entries }: Array_.Args) {
        super();
        this.entries = entries ?? [];
    }

    public write(writer: Writer): void {
        writer.write("[");
        this.entries.forEach((entry, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            entry.write(writer);
        });
        writer.write("]");
    }
}
