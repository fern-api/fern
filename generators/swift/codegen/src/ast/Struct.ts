import Swift, { AccessLevel, Type } from "..";
import { Field } from "./Field";
import { AstNode, Writer } from "./core";

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
        /* The field variables in the class */
        fields?: Field[];
    }
}

export class Struct extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly fields?: Field[];
    public readonly inheritance?: Type[];

    constructor({ accessLevel, name, inheritance, fields }: Struct.Args) {
        super();
        this.accessLevel = accessLevel;
        this.name = name;
        this.inheritance = inheritance;
        this.fields = fields;
    }

    private buildTitle(): string | undefined {
        if (!this.inheritance) {
            return this.name;
        }

        const names = this.inheritance.map((obj) => obj.name).join(", ");
        return `${this.name}: ${names}`;
    }

    public write(writer: Writer): void {
        // example: public struct Name {
        writer.openBlock(
            [this.accessLevel, "struct", this.buildTitle()],
            "{",
            () => {
                if (this.fields) {
                    this.fields.forEach((field) => {
                        writer.writeNode(field);
                    });
                }
            },
            "}"
        );
    }
}
