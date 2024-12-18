import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Func {
    interface Args {
        name: string;
        parameters: Parameter[];
        return_: Type[];
        body: CodeBlock | undefined;
        docs: string | undefined;
    }
}

export class Func extends AstNode {
    protected _name: string;
    protected _parameters: Parameter[];
    protected _return_: Type[];
    protected _body: CodeBlock | undefined;
    protected _docs: string | undefined;

    constructor({ name, parameters, return_, body, docs }: Func.Args) {
        super();
        this._name = name;
        this._parameters = parameters;
        this._return_ = return_;
        this._body = body;
        this._docs = docs;
    }

    public get name(): string {
        return this._name;
    }

    public get parameters(): Parameter[] {
        return this._parameters;
    }

    public get return_(): Type[] {
        return this._return_;
    }

    public get body(): CodeBlock | undefined {
        return this._body;
    }

    public get docs(): string | undefined {
        return this._docs;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write("const ");
        writer.write(`${this.name}`);
        writer.write(" = ");
        writer.delimit(this._parameters, ", ", (parameter) => parameter.writeWithType(writer), "(", ")");
        if (this._return_.length > 0) {
            writer.write(": ");
            if (this._return_.length === 1) {
                const returnType = this._return_[0];
                if (returnType != null) {
                    returnType.write(writer);
                }
            } else {
                writer.write("(");
                writer.delimit(this._return_, ", ", (type) => type.write(writer), "(", ")");
                writer.write(")");
            }
        }
        writer.write(" => ");
        writer.writeLine("{");
        writer.indent();
        this.body?.write(writer);
        writer.dedent();
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("}");
    }
}
