import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Func, Import, Class } from "../swift";

export declare namespace Struct {
    interface Args {
        accessLevel?: AccessLevel,
        name: string,
        inheritance?: Class[],
    }
}

export class Struct extends AstNode {

    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly inheritance?: Class[];

    constructor({ 
        accessLevel, 
        name,
        inheritance,
    }: Struct.Args) {
        super(Swift.indentSize);
        this.accessLevel = accessLevel;
        this.name = name;
        this.inheritance = inheritance;
    }

    private buildTitle(): string | undefined {

        if (!this.inheritance) {
            return this.name;
        }

        const names = this.inheritance.map(obj => obj.name).join(", ");
        return `${this.name}: ${names}`;

    }

    public write(writer: Writer): void {

        // e.g. public struct StructName {
        writer.openBlock([this.accessLevel, "struct", this.buildTitle()], "{", () => {

            writer.write("print(\"Hey\")");

        }, "}");

        // Common for swift classes to have an extra line at bottom of file
        writer.newLine();

    }

}
