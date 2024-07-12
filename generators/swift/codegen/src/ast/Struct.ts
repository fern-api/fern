import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Enum, Type } from "..";
import { Field } from "./Field";

/*

Builds Swift Structs
====================

Example:

private struct TopGun: Movie {
    let description: String
}

Breakdown:

{accessLevel} struct {name}: {inheritance} {
    {fields}
}

*/

export declare namespace Struct {
    interface Args {
        /* The access level of the type */
        accessLevel?: AccessLevel;
        /* The name of the struct */
        name: string;
        /* The inheritance hierarchy of this type */
        inheritance?: Type[];
        /* Subclasses */
        subclasses?: (Enum | Type)[];
        /* The field variables in the class */
        fields?: Field[];
    }
}

export class Struct extends AstNode {

    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly fields?: Field[];
    public readonly inheritance?: Type[];
    public readonly subclasses?: (Enum | Type)[];

    constructor(args: Struct.Args) {
        super(Swift.indentSize);
        this.accessLevel = args.accessLevel;
        this.name = args.name;
        this.inheritance = args.inheritance;
        this.subclasses = args.subclasses;
        this.fields = args.fields;
    }

    private buildTitle(): string | undefined {

        if (!this.inheritance) {
            return this.name;
        }

        const names = this.inheritance.map(obj => obj.name).join(", ");
        return `${this.name}: ${names}`;

    }

    public write(writer: Writer): void {

        // example: public struct Name {
        writer.openBlock([this.accessLevel, "struct", this.buildTitle()], "{", () => {

            if (this.subclasses) {
                writer.newLine();
                this.subclasses.forEach(subclass => {
                    writer.writeNode(subclass);
                    writer.newLine();
                });
            }

            if (this.fields) {
                this.fields.forEach(field => {
                    writer.writeNode(field);
                });
            }

            if (this.subclasses && this.fields) {
                writer.newLine();
            }

        }, "}");

    }

}
