import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift from "..";

export declare namespace Import {
    interface Args {
        packageName: string;
    }
}

export class Import extends AstNode {
    public readonly packageName: string;

    constructor({ packageName }: Import.Args) {
        super(Swift.indentSize);
        this.packageName = packageName;
    }

    public write(writer: Writer): void {
        writer.write(`import ${this.packageName}`);
    }
}
