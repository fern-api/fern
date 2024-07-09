import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Func, Import, ClassLevel } from "../swift";

export declare namespace Type {
    interface Args {
        accessLevel?: AccessLevel;
        classLevel?: ClassLevel;
        name: string;
        functions?: Func[];
        inheritance?: Type[],
    }
}

export class Type extends AstNode {

    public readonly accessLevel?: AccessLevel;
    public readonly classLevel?: ClassLevel;
    public readonly name: string;
    public readonly functions?: Func[];
    public readonly inheritance?: Type[];

    constructor({ 
        accessLevel, 
        classLevel, 
        name,
        functions,
        inheritance,
    }: Type.Args) {
        super(Swift.indentSize);
        this.accessLevel = accessLevel;
        this.classLevel = classLevel;
        this.name = name;
        this.functions = functions;
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

        // example: public class Name {
        writer.openBlock([this.accessLevel, this.classLevel, this.buildTitle()], "{", () => {

            writer.newLine();

            if (this.functions) {
                this.functions.forEach(func => {
                    writer.writeNode(func);
                    writer.newLine();
                });
            }

        }, "}");

    }

}
