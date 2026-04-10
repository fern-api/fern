import { AstNode } from "../ruby.js";
import { Writer } from "./core/Writer.js";
import { Parameter } from "./Parameter.js";

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
