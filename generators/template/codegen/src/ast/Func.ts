import { AstNode, Writer } from "@fern-api/generator-commons";
import LANGUAGE from "../template";

export declare namespace Func {
    interface Args {
        name: string;
    }
}

export class Func extends AstNode {
    public readonly name: string;

    constructor({ name }: Func.Args) {
        super(LANGUAGE.indentSize);
        this.name = name;
    }

    public write(writer: Writer): void {
        writer.openBlock(
            ["function", `${this.name}()`],
            "{",
            () => {
                writer.write('print("Hey there! 🌱")');
            },
            "}"
        );
    }
}
