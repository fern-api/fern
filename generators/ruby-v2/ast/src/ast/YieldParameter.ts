import { AstNode } from "../ruby.js";
import { Writer } from "./core/Writer.js";
import { Parameter } from "./Parameter.js";

export declare namespace YieldParameter {
    interface Args extends Parameter.Args {}
}

export class YieldParameter extends Parameter {
    public readonly initializer: AstNode | undefined;

    public write(writer: Writer): void {
        writer.write(`&${this.name}`);
    }
}
