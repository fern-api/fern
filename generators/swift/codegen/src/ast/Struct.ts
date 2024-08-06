import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Enum, Field, SwiftClass } from "..";
import { Optional } from "./Optional";

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
        /* Comment that appear above the class */
        comment?: string;
        /* The access level of the type */
        accessLevel?: AccessLevel;
        /* The name of the struct */
        name: string;
        /* The inheritance hierarchy of this type */
        inheritance?: SwiftClass[];
        /* Subclasses */
        subclasses?: (Enum | SwiftClass)[];
        /* The field variables in the class */
        fields?: Field[];
        /* Build initializer */
        addInitializer?: boolean;
    }
}

export class Struct extends AstNode {
    public readonly comment?: string;
    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly fields?: Field[];
    public readonly inheritance?: SwiftClass[];
    public readonly subclasses?: (Enum | SwiftClass)[];
    public readonly addInitializer: boolean;

    constructor(args: Struct.Args) {
        super(Swift.indentSize);
        this.comment = args.comment;
        this.accessLevel = args.accessLevel;
        this.name = args.name;
        this.inheritance = args.inheritance;
        this.subclasses = args.subclasses;
        this.fields = args.fields;
        this.addInitializer = args.addInitializer ?? false;
    }

    private buildStructTitle(): string | undefined {

        if (!this.inheritance) {
            return this.name;
        }

        const names = this.inheritance.map(obj => obj.name).join(", ");
        return `${this.name}: ${names}`;

    }

    private buildInitalizerTitle(): string | undefined {

        const args = this.fields?.map(obj => {
            const arg = `${obj.name}: ${obj.class.name}`;
            return obj.class instanceof Optional ? `${arg} = nil` : arg;
        }).join(", ");

        return `init(${args ?? ""})`;

    }

    public write(writer: Writer): void {

        // example: public struct Name {
        writer.openBlock([this.accessLevel, "struct", this.buildStructTitle()], "{", () => {

            if (this.subclasses) {
                writer.newLine();
                this.subclasses.forEach(subclass => {
                    writer.writeNode(subclass);
                    writer.newLine();
                });
            }

            if (this.fields) {
                this.fields.forEach(field => {
                    if (field.comment) { writer.newLine(); }
                    writer.writeNode(field);
                });
            }

            if (this.subclasses && this.fields) {
                writer.newLine();
            }

            if (this.addInitializer) {

                if (this.comment) {
                    writer.writeNode(Swift.makeComment({ comment: this.comment }));
                }

                writer.openBlock([this.accessLevel, this.buildInitalizerTitle()], "{", () => {
                    this.fields?.forEach(field => {
                        writer.write(`self.${field.name} = ${field.name}`);
                    });
                }, "}");

                writer.newLine();
                
            }

        }, "}");

    }

}
