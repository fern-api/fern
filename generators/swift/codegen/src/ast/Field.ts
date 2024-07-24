import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, SwiftClass } from "..";
import { VariableType } from "./VariableType";

export declare namespace Field {
    interface Args {
        accessLevel?: AccessLevel;
        variableType?: VariableType;
        name: string;
        class: SwiftClass,
        defaultValue?: string,
    }
}

export class Field extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly variableType?: VariableType;
    public readonly name: string;
    public readonly class: SwiftClass;
    public readonly defaultValue?: string; // TODO

    constructor({ 
        accessLevel, 
        variableType,
        name,
        class: valueType,
        defaultValue,
    }: Field.Args) {
        super(Swift.indentSize);
        this.accessLevel = accessLevel;
        this.variableType = variableType;
        this.name = name;
        this.class = valueType;
        this.defaultValue = defaultValue;
    }

    public write(writer: Writer): void {

        // e.g. public static let name: String
        const title = [this.accessLevel, this.variableType ?? VariableType.Let, `${this.name}:`, this.class.name].join(" ");
        writer.write(title);

    }

}
