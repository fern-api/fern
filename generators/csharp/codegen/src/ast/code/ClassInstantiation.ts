import {
    AbstractAstNode,
    Arguments,
    hasNamedArgument,
    isNamedArgument
} from "@fern-api/browser-compatible-base-generator";
import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { type ClassReference } from "../types/ClassReference";

export declare namespace ClassInstantiation {
    interface Args {
        classReference: ClassReference;
        // A map of the field for the class and the value to be assigned to it.
        arguments_: Arguments | ClassInstantiation[];
        /**
         * Lets you use constructor (rather than object initializer syntax) even if you pass in named arguments
         * @deprecated Use properties instead
         * @see properties
         */
        forceUseConstructor?: boolean;
        properties?: Property[];
        // Write the instantiation across multiple lines
        multiline?: boolean;
    }
    interface Property {
        name: AbstractAstNode | string;
        value: AbstractAstNode | string;
    }
}

export class ClassInstantiation extends AstNode {
    public readonly classReference: ClassReference;
    public readonly arguments_: Arguments | ClassInstantiation[];
    private readonly forceUseConstructor: boolean;
    private readonly properties: ClassInstantiation.Property[];
    public readonly multiline: boolean;

    /* eslint-disable deprecation/deprecation */
    constructor(
        { classReference, arguments_, forceUseConstructor, properties, multiline }: ClassInstantiation.Args,
        generation: Generation
    ) {
        super(generation);
        this.classReference = classReference;
        this.arguments_ = arguments_;
        this.forceUseConstructor = forceUseConstructor ?? false;
        this.properties = properties ?? [];
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
            writer.write(" {");
        } else {
            writer.write("(");
        }

        if (this.arguments_.length === 0) {
            this.writeEnd({ writer, hasNamedArguments });
            return;
        }

        if (this.multiline) {
            writer.newLine();
        }

        writer.indent();
        this.arguments_.forEach((argument, idx) => {
            if (isNamedArgument(argument)) {
                writer.write(`${argument.name}`);
                if (this.forceUseConstructor) {
                    writer.write(": ");
                } else {
                    writer.write(" = ");
                }
                writer.write(argument.assignment);
            } else {
                argument.write(writer);
            }
            if (idx < this.arguments_.length - 1) {
                writer.write(",");
                if (!this.multiline) {
                    writer.write(" ");
                }
            }
            if (this.multiline) {
                writer.newLine();
            }
        });
        writer.dedent();

        this.writeEnd({ writer, hasNamedArguments });
    }

    private writeEnd({ writer, hasNamedArguments }: { writer: Writer; hasNamedArguments: boolean }): void {
        if (hasNamedArguments && !this.forceUseConstructor) {
            writer.write("}");
        } else {
            writer.write(")");
        }
        if (this.properties.length > 0) {
            writer.write("{");
            if (this.multiline) {
                writer.newLine();
                writer.indent();
            } else {
                writer.write(" ");
            }
            this.properties.forEach((property, idx) => {
                writer.write(property.name, " = ", property.value);
                if (idx < this.properties.length - 1) {
                    writer.write(",");
                    if (this.multiline) {
                        writer.newLine();
                    } else {
                        writer.write(" ");
                    }
                }
            });
            if (this.multiline) {
                writer.dedent();
                writer.newLine();
            }
            writer.write("}");
        }
    }
}
