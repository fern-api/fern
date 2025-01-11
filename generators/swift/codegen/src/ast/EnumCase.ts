import Swift from "..";
import { AstNode, Writer } from "./core";

export declare namespace EnumCase {
    interface Args {
        name: string;
        key?: string;
    }
}

export class EnumCase extends AstNode {
    public readonly name: string;
    public readonly key?: string;

    constructor({ name, key }: EnumCase.Args) {
        super();
        this.name = name;
        this.key = key;
    }

    public write(writer: Writer): void {
        const statement = this.key ? `case ${this.name} = ${this.key}` : `case ${this.name}`;
        writer.write(statement);
    }
}
