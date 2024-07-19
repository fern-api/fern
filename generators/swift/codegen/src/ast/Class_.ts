import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Enum, Func } from "..";
import { Field } from "./Field";
import { Optional } from "./Optional";

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

export declare namespace Class_ {
    interface Args {
        /* The access level of the type */
        accessLevel?: AccessLevel;
        /* The name of the type */
        name: string;
        /* The subclasses of this type, which can be other types or enums */
        subclasses?: (Class_ | Enum)[];
        /* The field variables in the class */
        fields?: Field[];
        /* The functions associated with this type */
        functions?: Func[];
        /* The inheritance hierarchy of this type */
        inheritance?: Class_[];
    }
}

export class Class_ extends AstNode {

    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly subclasses?: (Class_ | Enum)[];
    public readonly fields?: Field[];
    public readonly functions?: Func[];
    public readonly inheritance?: Class_[];

    constructor(args: Class_.Args) {
        super(Swift.indentSize);
        this.accessLevel = args.accessLevel;
        this.name = args.name;
        this.subclasses = args.subclasses;
        this.fields = args.fields;
        this.functions = args.functions;
        this.inheritance = args.inheritance;
    }

    public toOptional(): Optional {
        return Swift.makeOptional({
            class: this
        });
    }

    // eslint-disable-next-line @typescript-eslint/array-type
    // public toArray(): Array_ {
    //     return Swift.makeArray({
    //         class: this
    //     });
    // }

    private buildTitle(): string | undefined {

        if (!this.inheritance) {
            return this.name;
        }

        const names = this.inheritance.map(obj => obj.name).join(", ");
        return `${this.name}: ${names}`;

    }

    public write(writer: Writer): void {

        // example: public class Name {
        writer.openBlock([this.accessLevel, "class", this.buildTitle()], "{", () => {

            writer.newLine();

            if (this.subclasses) {
                this.subclasses.forEach(sub => {
                    writer.writeNode(sub);
                    writer.newLine();
                });
            }

            if (this.fields) {
                this.fields.forEach(field => {
                    writer.writeNode(field);
                });
                writer.newLine();
            }

            if (this.functions) {
                this.functions.forEach(func => {
                    writer.writeNode(func);
                    writer.newLine();
                });
            }

        }, "}");

    }

}
