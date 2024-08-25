import { AstNode, Writer } from "@fern-api/generator-commons";
import LANGUAGE, { Func } from "../template";

export declare namespace Class {
    interface Args {
        name: string;
        functions: Func[];
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly functions: Func[];

    constructor({ name, functions }: Class.Args) {
        super(LANGUAGE.indentSize);
        this.name = name;
        this.functions = functions;
    }

    public write(writer: Writer): void {
        writer.openBlock(
            ["class", this.name],
            "{",
            () => {
                writer.newLine();

                this.functions.forEach((func) => {
                    writer.writeNode(func);
                    writer.newLine();
                });
            },
            "}"
        );
    }
}
