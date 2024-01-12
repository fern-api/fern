import { AstNode } from "./AstNode";
import { ClassReference } from "./ClassReference";
import { Expression } from "./Expression";
import { FunctionInvocation } from "./FunctionInvocation";
import { Parameter } from "./Parameter";

export declare namespace Function_ {
    export interface Init extends AstNode.Init {
        name: string;
        functionBody: (Expression | FunctionInvocation)[];
        parameters?: Parameter[];
        isAsync?: boolean;
        isStatic?: boolean;
        returnValue?: ClassReference;
    }
}
export class Function_ extends AstNode {
    public name: string;

    public parameters: Parameter[];
    // Could make this an Expression, but returns are specific to functions, so might leave it here for now
    public returnValue: ClassReference | undefined;
    public functionBody: (Expression | FunctionInvocation)[];
    public isAsync: boolean;
    public isStatic: boolean;

    constructor({
        name,
        functionBody,
        parameters = [],
        isAsync = false,
        isStatic = false,
        returnValue,
        ...rest
    }: Function_.Init) {
        super(rest);
        this.name = name;
        this.parameters = parameters;
        this.returnValue = returnValue;
        this.functionBody = functionBody;
        this.isAsync = isAsync;
        this.isStatic = isStatic;
    }

    // When writing the definition
    public writeInternal(startingTabSpaces: number): string {
        // Write docstring
        // Write function signature
        // Write function body
        return "";
    }
}
