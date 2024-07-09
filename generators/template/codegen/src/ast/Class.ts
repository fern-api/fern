import { AstNode, Writer } from "@fern-api/generator-commons";
import Lang, { Func } from "../lang";

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
        super(Lang.indentSize);
        this.name = name;
        this.functions = functions;
    }

    public write(writer: Writer): void {
        writer.write(`class ${this.name} {`);

        writer.newLine();

        writer.openIndent();

        this.functions.forEach((func) => {
            writer.writeNode(func);
            writer.newLine();
        });

        writer.closeIndent();

        writer.write("}");
    }
}
