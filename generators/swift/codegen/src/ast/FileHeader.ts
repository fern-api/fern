import { AstNode, Writer } from "@fern-api/generator-commons";
import { INDENT_SIZE } from "../lang";

export declare namespace FileHeader {
    interface Args {
        header: string;
    }
}

export class FileHeader extends AstNode {

    public readonly header: string;

    constructor({ 
        header,
    }: FileHeader.Args) {
        super(INDENT_SIZE);
        this.header = header;
    }
 
    public write(writer: Writer): void {
        writer.write(this.header);
    }
    
}
