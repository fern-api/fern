import { AstNode } from "../ruby";
import { Writer } from "./core/Writer";
import { Parameter } from "./Parameter";

export declare namespace PositionalParameter {
    interface Args extends Parameter.Args {
        /* The default value of this parameter. */
        initializer?: AstNode;
    }
}

export class PositionalParameter extends Parameter {
    public readonly initializer: AstNode | undefined;

    constructor({ name, type, optional, initializer }: PositionalParameter.Args) {
        super({ name, type, optional });

        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        writer.write(this.name);

        if (this.initializer) {
            writer.write(` = ${this.initializer.write(writer)}`);
        }
    }

    public writeTypeDefinition(writer: Writer): void {
        if (this.optional) {
            writer.write("?");
        }

        this.type.writeTypeDefinition(writer);
    }
}
