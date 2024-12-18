import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { Function } from "./Function";
import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Method {
    interface Args {
        reference: Reference;
        name: string;
        parameters: Parameter[];
        return_: Type[];
        body?: CodeBlock;
        docs?: string;
    }
}

export class Method extends Function {
    public readonly reference: Reference;

    constructor({ reference, name, parameters, return_, body, docs }: Method.Args) {
        super({ name, parameters, return_, body, docs });
        this.reference = reference;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        // TODO: Add visibility, make this nest in an object eventually
        writer.write("function ");
        writer.write(`${this._name}`);
        writer.writeLine("(");
        writer.delimit({
            nodes: this._parameters,
            delimiter: ",\n",
            writeFunction: (parameter) => parameter.writeWithType(writer)
        });
        writer.writeLine(")");
        if (this._return_.length > 0) {
            writer.write(": ");
            if (this._return_.length === 1) {
                const returnType = this._return_[0];
                if (returnType != null) {
                    writer.writeNode(returnType);
                }
            } else {
                writer.writeLine("(");
                writer.delimit({
                    nodes: this._return_,
                    delimiter: ", ",
                    writeFunction: (type) => type.write(writer)
                });
                writer.write(")");
            }
        }
        writer.writeLine(" {");
        writer.indent();
        this._body?.write(writer);
        writer.dedent();
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("}");
        writer.writeNewLineIfLastLineNot();
    }
}
