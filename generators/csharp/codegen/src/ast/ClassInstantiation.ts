import { Arguments, hasNamedArgument, isNamedArgument } from "@fern-api/base-generator";

import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassInstantiation {
    interface Args {
        classReference: ClassReference;
        // A map of the field for the class and the value to be assigned to it.
        arguments_: Arguments;
        // Lets you use constructor (rather than object initializer syntax) even if you pass in named arguments
        forceUseConstructor?: boolean;
        // Write the instantiation across multiple lines
        multiline?: boolean;
    }
}

export class ClassInstantiation extends AstNode {
    public readonly classReference: ClassReference;
    public readonly arguments_: Arguments;
    private readonly forceUseConstructor: boolean;
    public readonly multiline: boolean;

    constructor({ classReference, arguments_, forceUseConstructor, multiline }: ClassInstantiation.Args) {
        super();
        this.classReference = classReference;
        this.arguments_ = arguments_;
        this.forceUseConstructor = forceUseConstructor ?? false;
        this.multiline = multiline ?? false;
    }

    public write(writer: Writer): void {
        if (this.classReference.namespaceAlias != null) {
            writer.write(`new ${this.classReference.namespaceAlias}.${this.classReference.name}`);
        } else {
            writer.write("new ");
            writer.writeNode(this.classReference);
        }

        const hasNamedArguments = hasNamedArgument(this.arguments_);
        if (hasNamedArguments && !this.forceUseConstructor) {
            writer.write("{");
        } else {
            writer.write("(");
        }

        writer.newLine();
        writer.indent();

        this.arguments_.forEach((argument, idx) => {
            if (isNamedArgument(argument)) {
                writer.write(`${argument.name} = `);
                writer.writeNodeOrString(argument.assignment);
            } else {
                argument.write(writer);
            }
            if (idx < this.arguments_.length - 1) {
                writer.write(",");
                if (this.multiline) {
                    writer.newLine();
                } else {
                    writer.write(" ");
                }
            }
        });
        writer.writeLine();
        writer.dedent();

        if (hasNamedArguments && !this.forceUseConstructor) {
            writer.write("}");
        } else {
            writer.write(")");
        }
    }
}
