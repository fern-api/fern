import { AstNode } from "../ruby";
import { Parameter } from "./Parameter";
import { Writer } from "./core/Writer";

export declare namespace KeywordSplatParameter {
    interface Args extends Parameter.Args {}
}

export class KeywordSplatParameter extends Parameter {
    public readonly initializer: AstNode | undefined;

    public write(writer: Writer): void {
        writer.write(`**${this.name}`);
    }
}
