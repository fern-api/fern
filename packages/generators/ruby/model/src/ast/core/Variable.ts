import { AstNode } from "../AstNode";
import { Class_, RubyClass } from "./Class_";

export enum VariableType {
    CLASS,
    INSTANCE,
    LOCAL
}
export declare namespace Variable {
    export interface Init extends AstNode.Init {
        name: string;
        type: Class_ | RubyClass;
        variableType: VariableType;
    }
}
export class Variable extends AstNode {
    public name: string;
    public type: Class_ | RubyClass;
    public variableType: VariableType;

    constructor({ name, type, variableType, ...rest }: Variable.Init) {
        super(rest);
        this.name = name;
        this.type = type;
        this.variableType = variableType;
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
