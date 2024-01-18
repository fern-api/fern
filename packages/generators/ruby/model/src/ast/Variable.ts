import { ClassReference } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { FunctionInvocation } from "./functions/FunctionInvocation";

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

    public writeInternal(startingTabSpaces: number): void {
        let templateString;
        switch (this.variableType) {
            case VariableType.CLASS:
                templateString = "@@%s";
                break;
            case VariableType.INSTANCE:
                templateString = "@%s";
                break;
            default:
                templateString = "%s";
                break;
        }
        this.addText({ stringContent: this.name, templateString, startingTabSpaces });
    }

    public toJson(): FunctionInvocation | undefined {
        return this.type.toJson(this);
    }

    public fromJson(): FunctionInvocation | undefined {
        return this.type.fromJson(this);
    }
}
