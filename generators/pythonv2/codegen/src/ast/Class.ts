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
    }

    public addVariable(variable: Variable): void {
        this.variables.push(variable);
    }
}
