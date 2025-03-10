import { AstNode } from "../ruby";
import { Parameter } from "./Parameter";
import { Writer } from "./core/Writer";

export declare namespace KeywordParameter {
    interface Args extends Parameter.Args {
        initializer?: AstNode;
    }
}

export class KeywordParameter extends Parameter {
    public readonly initializer: AstNode | undefined;

    constructor({ name, initializer }: KeywordParameter.Args) {
        super({ name });

        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        writer.write(`${this.name}:`);

        if (this.initializer) {
            writer.write(` ${this.initializer.write(writer)}`);
        }
    }
}
