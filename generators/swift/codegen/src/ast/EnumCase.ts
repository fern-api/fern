import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift from "..";

export declare namespace EnumCase {
    interface Args {
        name: string;
        value?: string;
        comment?: string;
    }
}

export class EnumCase extends AstNode {

    public readonly name: string;
    public readonly value?: string;
    public readonly comment?: string;

    constructor(args: EnumCase.Args) {
        super(Swift.indentSize);
        this.name = args.name;
        this.value = args.value;
        this.comment = args.comment;
    }

    public write(writer: Writer): void {

        if (this.comment) {
            writer.write(`/// ${this.comment}`);
        }

        const statement = this.value ? `case ${this.name} = ${this.value}` : `case ${this.name}`;
        writer.write(statement);

    }

}
