import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export declare namespace Attribute {
    interface Args {
        name: string;
        args?: string[];
        nested?: Attribute[];
    }
}

export class Attribute extends AstNode {
    public readonly name: string;
    public readonly args?: string[];
    public readonly nested?: Attribute[];

    public constructor({ name, args, nested }: Attribute.Args) {
        super();
        this.name = name;
        this.args = args;
        this.nested = nested;
    }

    public write(writer: Writer): void {
        writer.write(`#[${this.name}`);

        if (this.args && this.args.length > 0) {
            writer.write("(");
            this.args.forEach((arg, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.write(arg);
            });
            writer.write(")");
        }

        if (this.nested && this.nested.length > 0) {
            writer.write("(");
            this.nested.forEach((attr, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                attr.write(writer);
            });
            writer.write(")");
        }

        writer.write("]");
    }

    // Factory methods for common attributes
    public static derive(traits: string[]): Attribute {
        return new Attribute({
            name: "derive",
            args: traits
        });
    }

    public static serde = {
        rename: (value: string): Attribute =>
            new Attribute({
                name: "serde",
                args: [`rename = ${JSON.stringify(value)}`]
            }),

        with: (path: string): Attribute =>
            new Attribute({
                name: "serde",
                args: [`with = ${JSON.stringify(path)}`]
            }),

        skip: (): Attribute =>
            new Attribute({
                name: "serde",
                args: ["skip"]
            }),

        skipSerializingIf: (condition: string): Attribute =>
            new Attribute({
                name: "serde",
                args: [`skip_serializing_if = ${condition}`]
            }),

        // Union-specific serde attributes
        tag: (discriminant: string): Attribute =>
            new Attribute({
                name: "serde",
                args: [`tag = ${JSON.stringify(discriminant)}`]
            }),

        untagged: (): Attribute =>
            new Attribute({
                name: "serde",
                args: ["untagged"]
            }),

        flatten: (): Attribute =>
            new Attribute({
                name: "serde",
                args: ["flatten"]
            }),

        content: (field: string): Attribute =>
            new Attribute({
                name: "serde",
                args: [`content = ${JSON.stringify(field)}`]
            }),

        // For adjacently tagged unions
        tagAndContent: (tag: string, content: string): Attribute =>
            new Attribute({
                name: "serde",
                args: [`tag = ${JSON.stringify(tag)}`, `content = ${JSON.stringify(content)}`]
            })
    };
}
