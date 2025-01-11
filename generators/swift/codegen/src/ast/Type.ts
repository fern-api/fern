import Swift, { AccessLevel, ClassLevel, Enum, Func } from "..";
import { Field } from "./Field";
import { AstNode, Writer } from "./core";

/*

Builds Swift Types (Classes, Structs, etc)
==========================================

Example:

private class Mike: Person {

    class Snowboard {
        ...
    }
    
    func wave() {
        print("👋")
    }

}

Breakdown:

{accessLevel} {classLevel} {name}: {inheritance} {

    {subclasses}
    
    {functions}

}

*/

export declare namespace Type {
    interface Args {
        /* The access level of the type */
        accessLevel?: AccessLevel;
        /* The class level of the type, such as class or struct */
        classLevel?: ClassLevel;
        /* The name of the type */
        name: string;
        /* The subclasses of this type, which can be other types or enums */
        subclasses?: (Type | Enum)[];
        /* The field variables in the class */
        fields?: Field[];
        /* The functions associated with this type */
        functions?: Func[];
        /* The inheritance hierarchy of this type */
        inheritance?: Type[];
    }
}

export class Type extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly classLevel?: ClassLevel;
    public readonly name: string;
    public readonly subclasses?: (Type | Enum)[];
    public readonly fields?: Field[];
    public readonly functions?: Func[];
    public readonly inheritance?: Type[];

    constructor({ accessLevel, classLevel, name, subclasses, fields, functions, inheritance }: Type.Args) {
        super();
        this.accessLevel = accessLevel;
        this.classLevel = classLevel;
        this.name = name;
        this.subclasses = subclasses;
        this.fields = fields;
        this.functions = functions;
        this.inheritance = inheritance;
    }

    private buildTitle(): string | undefined {
        if (!this.inheritance) {
            return this.name;
        }

        const names = this.inheritance.map((obj) => obj.name).join(", ");
        return `${this.name}: ${names}`;
    }

    public write(writer: Writer): void {
        // example: public class Name {
        writer.openBlock(
            [this.accessLevel, this.classLevel, this.buildTitle()],
            "{",
            () => {
                writer.newLine();

                if (this.subclasses) {
                    this.subclasses.forEach((sub) => {
                        writer.writeNode(sub);
                        writer.newLine();
                    });
                }

                if (this.fields) {
                    this.fields.forEach((field) => {
                        writer.writeNode(field);
                    });
                    writer.newLine();
                }

                if (this.functions) {
                    this.functions.forEach((func) => {
                        writer.writeNode(func);
                        writer.newLine();
                    });
                }
            },
            "}"
        );
    }
}
