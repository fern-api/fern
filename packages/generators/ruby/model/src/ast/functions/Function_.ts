import { AstNode, NewLinePlacement } from "../AstNode";
import { ClassReference } from "../classes/ClassReference";
import { Expression } from "../expressions/Expression";
import { Parameter } from "../Parameter";
import { Yardoc } from "../Yardoc";
import { FunctionInvocation } from "./FunctionInvocation";

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
    public yardoc: Yardoc;

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

        this.yardoc = new Yardoc({ reference: { name: "docString", parameters, returnValue } });
    }

    private writeParameters(): string {
        return `(${this.parameters.map((a) => a.writeInternal(0)).join(", ")})`;
    }

    public writeInternal(startingTabSpaces: number): string {
        const functionSignature = this.writePaddedString(startingTabSpaces, `def ${this.isStatic && "self."}${this.name}${this.parameters.length > 0 && this.writeParameters()}`, NewLinePlacement.AFTER);
        return `
${this.documentation !== undefined && this.writePaddedString(startingTabSpaces, this.documentation, NewLinePlacement.AFTER)}
${this.yardoc.writeInternal(startingTabSpaces)}
${functionSignature}
${this.functionBody.map(expression => expression.writeInternal(startingTabSpaces))}
${this.writePaddedString(startingTabSpaces, "end", NewLinePlacement.AFTER)}
`;
    }
}
