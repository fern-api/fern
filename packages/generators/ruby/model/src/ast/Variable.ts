import { AstNode } from "./AstNode";
import { ClassReference } from "./classes/ClassReference";

export enum VariableType {
    CLASS,
    INSTANCE,
    LOCAL
}
export declare namespace Variable {
    export interface Init extends AstNode.Init {
        name: string;
        type: ClassReference;
        variableType: VariableType;
        isOptional?: boolean;
    }
}
export class Variable extends AstNode {
    public name: string;
    public type: ClassReference;
    public variableType: VariableType;
    public isOptional: boolean;

    constructor({ name, type, variableType, isOptional = false, ...rest }: Variable.Init) {
        super(rest);
        this.name = name;
        this.type = type;
        this.variableType = variableType;
        this.isOptional = isOptional;
    }

    public writeInternal(startingTabSpaces: number): string {
        switch (this.variableType) {
            case VariableType.CLASS:
                return this.writePaddedString(startingTabSpaces, `@@${this.name}`);
            case VariableType.INSTANCE:
                return this.writePaddedString(startingTabSpaces, `@${this.name}`);
            default:
                return this.writePaddedString(startingTabSpaces, this.name);
        }
    }
}
