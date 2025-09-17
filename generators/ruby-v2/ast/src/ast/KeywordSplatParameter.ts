import { AstNode } from "../ruby";
import { Writer } from "./core/Writer";
import { Parameter } from "./Parameter";

export declare namespace KeywordSplatParameter {
    interface Args extends Parameter.Args {}
}

export class KeywordSplatParameter extends Parameter {
    public readonly initializer: AstNode | undefined;

    public write(writer: Writer): void {
        writer.write(`**${this.name}`);
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write("**");
        this.type.writeTypeDefinition(writer);
    }
}
