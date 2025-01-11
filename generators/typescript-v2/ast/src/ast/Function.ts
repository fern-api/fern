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
        body: CodeBlock;
        return_?: Type;
        async?: boolean;
        docs?: string;
    }
}

export class Function extends AstNode {
    readonly name: string;
    readonly parameters: Parameter[];
    readonly async: boolean;
    readonly body: CodeBlock;
    readonly return_: Type | undefined;
    readonly docs: string | undefined;

    constructor({ name, parameters, async, body, return_, docs }: Function.Args) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.async = async ?? false;
        this.body = body;
        this.return_ = return_;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        if (this.async) {
            writer.write("async ");
        }
        writer.write("function ");
        writer.write(`${this.name}`);
        this.writeParameters(writer);
        if (this.return_ != null) {
            writer.write(": ");
            writer.writeNode(this.async ? Type.promise(this.return_) : this.return_);
        }
        writer.writeLine(" {");
        writer.indent();
        this.body?.write(writer);
        writer.dedent();
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("}");
    }

    private writeParameters(writer: Writer): void {
        if (this.parameters.length === 0) {
            writer.write("()");
            return;
        }
        writer.indent();
        writer.writeLine("(");
        for (const parameter of this.parameters) {
            writer.writeNode(parameter);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write(")");
    }
}
