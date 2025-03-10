import { AstNode } from "../ruby";
import { Parameter } from "./Parameter";
import { Writer } from "./core/Writer";

export declare namespace PositionalSplatParameter {
    interface Args extends Parameter.Args {}
}

export class PositionalSplatParameter extends Parameter {
    public write(writer: Writer): void {
        writer.write(`*${this.name}`);
    }
}
