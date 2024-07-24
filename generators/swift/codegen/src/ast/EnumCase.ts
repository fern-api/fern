import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift from "..";

export declare namespace EnumCase {
    interface Args {
        name: string;
        key?: string;
    }
}

export class EnumCase extends AstNode {

    public readonly name: string;
    public readonly key?: string;

    constructor(args: EnumCase.Args) {
        super(Swift.indentSize);
        this.name = args.name;
        this.key = args.key;
    }

    public write(writer: Writer): void {
        const statement = this.key ? `case ${this.name} = ${this.key}` : `case ${this.name}`;
        writer.write(statement);
    }

}
