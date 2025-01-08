import { Access } from "./Access";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Comment } from "./Comment";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The access of the method */
        access: Access;
        /* The parameters of the method */
        parameters: Parameter[];
        /* The exceptions that can be thrown, if any */
        throws?: ClassReference[];
        /* The return type of the method */
        return_?: Type;
        /* The body of the method */
        body?: CodeBlock;
        /* Documentation for the method */
        docs?: string;
        /* The class this method belongs to, if any */
        classReference?: ClassReference;
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly access: Access;
    public readonly parameters: Parameter[];
    public readonly throws: ClassReference[];
    public readonly return_: Type | undefined;
    public readonly body: CodeBlock | undefined;
    public readonly docs: string | undefined;
    public readonly classReference: ClassReference | undefined;

    constructor({ name, access, parameters, throws, return_, body, docs, classReference }: Method.Args) {
        super();
        this.name = name;
        this.access = access;
        this.parameters = parameters;
        this.throws = throws ?? [];
        this.return_ = return_;
        this.body = body;
        this.docs = docs;
        this.classReference = classReference;
    }

    public write(writer: Writer): void {
        this.writeComment(writer);
        writer.write(`${this.access} function ${this.name}(`);
        this.parameters.forEach((parameter, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            parameter.write(writer);
        });
        writer.write("): ");
        if (this.return_ != null) {
            this.return_.write(writer);
        } else {
            writer.write("void");
        }
        writer.writeLine(" {");

        writer.indent();
        this.body?.write(writer);
        writer.dedent();

        writer.writeLine("}");
    }

    private writeComment(writer: Writer): void {
        const comment = new Comment({ docs: this.docs });
        for (const parameter of this.parameters) {
            comment.addTag({
                tagType: "param",
                type: parameter.type,
                name: parameter.name,
                docs: parameter.docs
            });
        }
        if (this.return_ != null) {
            comment.addTag({
                tagType: "return",
                type: this.return_
            });
        }
        for (const throw_ of this.throws) {
            comment.addTag({
                tagType: "throws",
                type: Type.reference(throw_)
            });
        }
        writer.writeNode(comment);
    }
}
