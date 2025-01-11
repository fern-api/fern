import Swift, { AccessLevel, Type } from "..";
import { VariableType } from "./VariableType";
import { AstNode, Writer } from "./core";

export declare namespace Field {
    interface Args {
        accessLevel?: AccessLevel;
        variableType?: VariableType;
        name: string;
        valueType: Type;
        defaultValue?: string;
    }
}

export class Field extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly variableType?: VariableType;
    public readonly name: string;
    public readonly valueType: Type; // TODO
    public readonly defaultValue?: string; // TODO

    constructor({ accessLevel, variableType, name, valueType, defaultValue }: Field.Args) {
        super();
        this.accessLevel = accessLevel;
        this.variableType = variableType;
        this.name = name;
        this.valueType = valueType;
        this.defaultValue = defaultValue;
    }

    public write(writer: Writer): void {
        // e.g. public static let name: String
        const title = [
            this.accessLevel,
            this.variableType ?? VariableType.Let,
            `${this.name}:`,
            this.valueType.name
        ].join(" ");
        writer.write(title);
    }
}
