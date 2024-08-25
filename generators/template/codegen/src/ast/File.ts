import { AstNode, Writer } from "@fern-api/generator-commons";
import LANGUAGE, { Class } from "../template";

export declare namespace File {
    interface Args {
        name: string;
        class: Class;
    }
}

export class File extends AstNode {
    public readonly name: string;
    public readonly class: Class;

    constructor({ name, class: classInstance }: File.Args) {
        super(LANGUAGE.indentSize);
        this.name = name;
        this.class = classInstance;
    }

    public write(writer: Writer): void {
        writer.write(`// 🌿 ${this.name}`);

        writer.newLine();

        writer.writeNode(this.class);

        writer.newLine();
    }
}
