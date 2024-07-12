import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift from "..";

export declare namespace FileHeader {
    interface Args {
        header: string;
    }
}

export class FileHeader extends AstNode {
    public readonly header: string;

    constructor({ header }: FileHeader.Args) {
        super(Swift.indentSize);
        this.header = header;
    }

    public write(writer: Writer): void {
        writer.write(this.header);
    }
}
