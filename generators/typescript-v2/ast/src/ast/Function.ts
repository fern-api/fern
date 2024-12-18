import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Function {
    interface Args {
        name: string;
        parameters: Parameter[];
        return_?: Type;
        body: CodeBlock | undefined;
        docs: string | undefined;
    }
}

export class Function extends AstNode {
    readonly name: string;
    readonly parameters: Parameter[];
    readonly return_?: Type;
    readonly body: CodeBlock | undefined;
    readonly docs: string | undefined;

    constructor({ name, parameters, return_, body, docs }: Function.Args) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.return_ = return_;
        this.body = body;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write("function ");
        writer.write(`${this.name}`);
        writer.writeLine("(");
        writer.delimit({
            nodes: this.parameters,
            delimiter: ",\n",
            writeFunction: (parameter) => parameter.writeWithType(writer)
        });
        writer.writeLine(")");
        if (this.return_ != null) {
            writer.write(": ");
            writer.writeNode(this.return_);
        }
        writer.writeLine("{");
        writer.indent();
        this.body?.write(writer);
        writer.dedent();
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("}");
    }
}
