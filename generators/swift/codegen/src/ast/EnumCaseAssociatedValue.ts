import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { SwiftClass } from "..";

export declare namespace EnumCaseAssociatedValue {
    interface Args {
        name: string;
        value: SwiftClass;
        comment?: string;
    }
}

export class EnumCaseAssociatedValue extends AstNode {

    public readonly name: string;
    public readonly value: SwiftClass;
    public readonly comment?: string;

    constructor(args: EnumCaseAssociatedValue.Args) {
        super(Swift.indentSize);
        this.name = args.name;
        this.value = args.value;
        this.comment = args.comment;
    }

    public write(writer: Writer): void {

        if (this.comment) {
            writer.newLine();
            writer.writeNode(Swift.makeComment({ comment: this.comment }));
        }

        writer.write(`case ${this.name}(${this.value.name})`);

    }

}
