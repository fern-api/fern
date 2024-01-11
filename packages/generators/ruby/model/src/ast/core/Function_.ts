import { AstNode } from "../AstNode";
import { Class_ } from "./Class_";
import { Expression } from "./Expression";
import { Parameter } from "./Parameter";
import { Yardoc } from "./Yardoc";

export declare namespace Function_ {
    export interface Init extends AstNode.Init {
        name: string;
        functionBody: Expression[];
        parameters: Parameter[];
        isAsync: boolean;
        returnValue?: Class_;
    }
}
export class Function_ extends AstNode {
    public name: string;

    public parameters: Parameter[];
    // Could make this an Expression, but returns are specific to functions, so might leave it here for now
    public returnValue: Class_ | undefined;
    public functionBody: Expression[];
    public isAsync: boolean;

    constructor({ name, functionBody, parameters = [], isAsync = false, returnValue, ...rest }: Function_.Init) {
        super(rest);
        this.name = name;
        this.parameters = parameters;
        this.returnValue = returnValue;
        this.functionBody = functionBody;
        this.isAsync = isAsync;
    }

    // When invoking a function
    public writeInvokation(argumentMap: Map<string, string>): string {
        return "";
    }

    // When writing the definition
    public writeInternal(startingTabSpaces: number): string {
        let print = "";
        // Write docstring
        print += new Yardoc(this.documentation, {
            name: "docString",
            parameters: this.parameters,
            returnClass: this.returnValue
        }).writeInternal(startingTabSpaces);
        // Write function signature
        // Write function body
        return print;
    }
}
