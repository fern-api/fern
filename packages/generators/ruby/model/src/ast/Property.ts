import { AstNode } from "./AstNode";
import { ClassReference } from "./ClassReference";
import { Parameter } from "./Parameter";
import { Variable, VariableType } from "./Variable";

export declare namespace Property {
    export interface Init extends AstNode.Init {
        name: string;
        type: ClassReference;
        wireValue?: string;
        isOptional?: boolean;
    }
}
export class Property extends AstNode {
    public name: string;
    public type: ClassReference;
    public wireValue: string | undefined;
    public isOptional: boolean;

    constructor({ name, type, wireValue, isOptional = false, ...rest }: Property.Init) {
        super(rest);
        this.name = name;
        this.type = type;
        this.wireValue = wireValue;
        this.isOptional = isOptional;
    }

    public toParameter(defaultValue?: Variable | string): Parameter {
        return new Parameter({
            name: this.name,
            type: this.type,
            isOptional: this.isOptional,
            defaultValue
        });
    }

    public toVariable(): Variable {
        return new Variable({
            name: this.name,
            type: this.type,
            variableType: VariableType.CLASS,
            isOptional: this.isOptional
        });
    }

    public writeInternal(startingTabSpaces: number): string {
        return `:${this.name}`;
    }
}
