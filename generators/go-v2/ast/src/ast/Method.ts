import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { GoTypeReference } from "./GoTypeReference";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The parameters of the method */
        parameters: Parameter[];
        /* The return type of the method */
        return_: Type[];
        /* The body of the method */
        body?: CodeBlock;
        /* Documentation for the method */
        docs?: string;
        /* The class this method belongs to, if any */
        typeReference?: GoTypeReference;
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly parameters: Parameter[];
    public readonly return_: Type[];
    public readonly body: CodeBlock | undefined;
    public readonly docs: string | undefined;
    public readonly typeReference: GoTypeReference | undefined;

    constructor({ name, parameters, return_, body, docs, typeReference }: Method.Args) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.return_ = return_;
        this.body = body;
        this.docs = docs;
        this.typeReference = typeReference;
    }

    public write(writer: Writer): void {
        writer.writeNode(new Comment({ docs: this.docs }));
        writer.write("func ");
        if (this.typeReference != null) {
            this.writeReceiver({ writer, typeReference: this.typeReference });
        }
        writer.write(`${this.name}`);
        if (this.parameters.length === 0) {
            writer.write("() ");
        } else {
            writer.writeLine("(");
            for (const parameter of this.parameters) {
                writer.writeNode(parameter);
                writer.writeLine(",");
            }
            writer.write(")");
        }
        if (this.return_ != null) {
            writer.write("(");
            this.return_.forEach((returnType, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.writeNode(returnType);
            });
            writer.write(")");
        }
        writer.writeLine(" {");
        writer.indent();
        this.body?.write(writer);
        writer.dedent();
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("}");
    }

    private writeReceiver({ writer, typeReference }: { writer: Writer; typeReference: GoTypeReference }): void {
        writer.write(`(${this.getReceiverName(typeReference.name)} `);
        typeReference.write(writer);
        writer.write(") ");
    }

    private getReceiverName(s: string): string {
        return s.charAt(0).toLowerCase();
    }
}
