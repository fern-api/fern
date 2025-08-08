import { AccessLevel } from "./AccessLevel";
import { CodeBlock } from "./CodeBlock";
import { AstNode, Writer } from "./core";
import { DocComment } from "./DocComment";
import { FunctionParameter } from "./FunctionParameter";

export declare namespace Initializer {
    interface Args {
        accessLevel?: AccessLevel;
        /** Whether the initializer can return `nil`. Initializers that return nil are said to be failable. */
        failable?: true;
        /** Whether the initializer can throw an error. */
        throws?: true;
        parameters?: FunctionParameter[];
        body?: CodeBlock;
        multiline?: true;
        docs?: DocComment;
    }
}

export class Initializer extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly failable?: true;
    public readonly throws?: true;
    public readonly parameters: FunctionParameter[];
    public readonly body: CodeBlock;
    public readonly multiline?: true;
    public readonly docs?: DocComment;

    constructor({ accessLevel, failable, throws, parameters, body, multiline, docs }: Initializer.Args) {
        super();
        this.accessLevel = accessLevel;
        this.failable = failable;
        this.throws = throws;
        this.parameters = parameters ?? [];
        this.body = body ?? CodeBlock.empty();
        this.multiline = multiline;
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write("init");
        if (this.failable) {
            writer.write("?");
        }
        writer.write("(");
        if (this.multiline) {
            writer.newLine();
            writer.indent();
        }
        this.parameters.forEach((parameter, parameterIdx) => {
            if (parameterIdx > 0) {
                writer.write(",");
                if (this.multiline) {
                    writer.newLine();
                } else {
                    writer.write(" ");
                }
            }
            parameter.write(writer);
        });
        if (this.multiline) {
            writer.newLine();
            writer.dedent();
        }
        writer.write(") ");
        if (this.throws) {
            writer.write("throws ");
        }
        this.body.write(writer);
    }
}
