import {
    Arguments,
    hasNamedArgument,
    isNamedArgument,
    NamedArgument,
    UnnamedArgument
} from "@fern-api/generator-commons";
import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassInstantiation {
    interface Args {
        /* The class reference to instantiate */
        classReference: ClassReference;
        /* The arguments passed into the class constructor */
        arguments_: Arguments;
    }
}

export class ClassInstantiation extends AstNode {
    public readonly classReference: ClassReference;
    public readonly arguments_: Arguments;

    constructor({ classReference, arguments_ }: ClassInstantiation.Args) {
        super();
        this.classReference = classReference;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.write("new ");
        writer.writeNode(this.classReference);

        if (this.arguments_.length === 0) {
            writer.write("()");
            return;
        }

        writer.writeLine("(");
        writer.indent();
        this.arguments_.forEach((argument, idx) => {
            if (isNamedArgument(argument)) {
                writer.write(`${argument.name}: `);
                argument.assignment.write(writer);
            } else {
                argument.write(writer);
            }
            writer.writeLine(",");
        });
        writer.dedent();
        writer.write(")");
    }
}
