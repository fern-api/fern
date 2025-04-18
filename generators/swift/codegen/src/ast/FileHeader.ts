import Swift from "..";
import { AstNode, Writer } from "./core";

export declare namespace FileHeader {
    interface Args {
        header: string;
    }
}

export class FileHeader extends AstNode {
    public readonly header: string;

    constructor({ header }: FileHeader.Args) {
        super();
        this.header = header;
    }

    public write(writer: Writer): void {
        writer.write(this.header);
    }
}
