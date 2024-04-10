import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassInstantiation {
    interface Args {
        classReference: ClassReference;
        // A map of the field for the class and the value to be assigned to it.
        arguments_: NamedArgument[] | UnnamedArgument[];
    }

    interface NamedArgument {
        name: string;
        assignment: CodeBlock;
    }

    type UnnamedArgument = CodeBlock;
}

export class ClassInstantiation extends AstNode {
    public readonly classReference: ClassReference;
    public readonly arguments_: ClassInstantiation.NamedArgument[] | ClassInstantiation.UnnamedArgument[];

    constructor({ classReference, arguments_ }: ClassInstantiation.Args) {
        super();
        this.classReference = classReference;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.write(`new ${this.classReference.name}(`);

        writer.newLine();
        writer.indent();
        this.arguments_.forEach((argument, idx) => {
            if (isNamedArgument(argument)) {
                writer.write(`${argument.name}: `);
                argument.assignment.write(writer);
            } else {
                argument.write(writer);
            }
            if (idx < this.arguments_.length - 1) {
                writer.write(", ");
            }
        });
        writer.dedent();

        writer.writeLine(");");
    }
}

function isNamedArgument(
    argument: ClassInstantiation.NamedArgument | ClassInstantiation.UnnamedArgument
): argument is ClassInstantiation.NamedArgument {
    return (argument as ClassInstantiation.NamedArgument)?.name != null;
}
