import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { Func } from "./Func";
import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Method {
    type Args = {
        reference: Reference;
        name: string;
        parameters: Parameter[];
        return_: Type[];
        body?: CodeBlock;
        docs?: string;
    };
}

export class Method extends Func {
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
        writer.delimit(this._parameters, ", ", (parameter) => parameter.writeWithType(writer), "(", ")");
        if (this._return_.length > 0) {
            writer.write(": ");
            if (this._return_.length === 1) {
                writer.writeNode(this._return_[0]!);
            } else {
                writer.delimit(this._return_, ", ", (type) => type.write(writer), "(", ")");
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
