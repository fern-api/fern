import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Func, Import } from "../swift";

export declare namespace Struct {
    interface Args {
        accessLevel?: AccessLevel,
        name: string,
        inheritance?: string[],
    }
}

export class Struct extends AstNode {

    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly inheritance?: string[];

    constructor({ 
        accessLevel, 
        name,
    }: Struct.Args) {
        super(Swift.indentSize);
        this.accessLevel = accessLevel;
        this.name = name;
    }

    public write(writer: Writer): void {

        // e.g. public struct StructName {
        writer.openBlock([this.accessLevel, "struct", this.name], "{", () => {

            writer.write("print(\"Hey\")");

        }, "}");

        // Common for swift classes to have an extra line at bottom of file
        writer.newLine();

    }

}
