import { AstNode } from "../ruby";
import { Writer } from "./core/Writer";
import { Parameter } from "./Parameter";

export declare namespace YieldParameter {
    interface Args extends Parameter.Args {}
}

export class YieldParameter extends Parameter {
    public readonly initializer: AstNode | undefined;

    public write(writer: Writer): void {
        writer.write(`&${this.name}`);
    }
}
