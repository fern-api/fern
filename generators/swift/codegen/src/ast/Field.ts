import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, SwiftClass } from "..";
import { Optional } from "./Optional";
import { VariableType } from "./VariableType";

export declare namespace Field {
    interface Args {
        comment?: string;
        accessLevel?: AccessLevel;
        variableType?: VariableType;
        name: string;
        class: SwiftClass | Optional,
    }
}

export class Field extends AstNode {
    public readonly comment?: string;
    public readonly accessLevel?: AccessLevel;
    public readonly variableType?: VariableType;
    public readonly name: string;
    public readonly class: SwiftClass | Optional;

    constructor(args: Field.Args) {
        super(Swift.indentSize);
        this.comment = args.comment;
        this.accessLevel = args.accessLevel;
        this.variableType = args.variableType;
        this.name = args.name;
        this.class = args.class;
    }

    public write(writer: Writer): void {

        if (this.comment) {
            writer.writeNode(Swift.makeComment({ comment: this.comment }));
        }

        // e.g. public static let name: String
        const title = [this.accessLevel, this.variableType ?? VariableType.Let, `${this.name}:`, this.class.name].join(" ");
        writer.write(title);

    }

}
