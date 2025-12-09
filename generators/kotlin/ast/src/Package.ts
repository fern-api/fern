import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export class Package implements AstNode {
    constructor(private readonly name: string) {}

    public write(writer: Writer): void {
        writer.write("package ");
        writer.write(this.name);
    }
}
