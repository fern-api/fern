import Swift, { AccessLevel, EnumCase, Type } from "..";
import { AstNode, Writer } from "./core";

export declare namespace Enum {
    interface Args {
        accessLevel?: AccessLevel;
        name: string;
        inheritance?: Type[];
        enumCases: EnumCase[];
    }
}

export class Enum extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly inheritance?: Type[];
    public readonly enumCases: EnumCase[];

    constructor({ accessLevel, name, inheritance, enumCases }: Enum.Args) {
        super();
        this.accessLevel = accessLevel;
        this.name = name;
        this.inheritance = inheritance;
        this.enumCases = enumCases;
    }

    private buildTitle(): string | undefined {
        if (!this.inheritance) {
            return this.name;
        }

        const names = this.inheritance.map((obj) => obj.name).join(", ");
        return `${this.name}: ${names}`;
    }

    public write(writer: Writer): void {
        // example: enum CodingKeys: String, CodingKey {
        writer.openBlock(
            ["enum", this.buildTitle()],
            "{",
            () => {
                if (this.enumCases) {
                    this.enumCases.forEach((value) => {
                        writer.writeNode(value);
                    });
                }
            },
            "}"
        );
    }
}
