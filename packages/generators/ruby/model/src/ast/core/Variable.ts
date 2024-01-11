import { AstNode } from "../AstNode";
import { Class_, RubyClass } from "./Class_";


export enum VariableType {
    CLASS, INSTANCE, LOCAL
}

export class Variable extends AstNode {
    public name: string;
    public type: Class_ | RubyClass;
    public variableType: VariableType;

    constructor(name: string, type: Class_ | RubyClass, variableType: VariableType, description?: string) {
        super(description);
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