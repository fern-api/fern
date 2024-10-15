import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Variable } from "./Variable";

export declare namespace Class {
    interface Args {
        /* The name of the Python class */
        name: string;
    }
}

export class Class extends AstNode {
    public readonly name: string;

    private variables: Variable[] = [];

    constructor({ name }: Class.Args) {
        super();
        this.name = name;
    }

    public write(writer: Writer): void {
        writer.write(`class ${this.name}:`);
        writer.newLine();

        writer.indent();
        this.writeVariables({ writer });
        writer.dedent();
    }

    public addVariable(variable: Variable): void {
        this.variables.push(variable);
    }

    private writeVariables({ writer }: { writer: Writer }): void {
        this.variables.forEach((variable, index) => {
            variable.write(writer);
            writer.writeNewLineIfLastLineNot();

            if (index < this.variables.length - 1) {
                writer.newLine();
            }
        });
    }
}
