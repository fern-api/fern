import { BLOCK_END } from "../../utils/Constants";
import { ClassReference } from "../classes/ClassReference";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { Import } from "../Import";
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

    private writeParameters(): string | undefined {
        return this.parameters.length > 0 ? `(${this.parameters.map((a) => a.write()).join(", ")})` : undefined;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.documentation, templateString: "# %s", startingTabSpaces });
        this.addText({
            stringContent: this.yardoc.write(startingTabSpaces),
            templateString: this.documentation !== undefined ? "#\n%s" : undefined,
            startingTabSpaces: this.documentation !== undefined ? startingTabSpaces : 0
        });
        this.addText({
            stringContent: this.isStatic ? `self.${this.name}` : this.name,
            templateString: "def %s",
            startingTabSpaces
        });
        this.addText({ stringContent: this.writeParameters(), appendToLastString: true, startingTabSpaces });
        this.functionBody.map((exp) =>
            this.addText({ stringContent: exp.write(this.tabSizeSpaces + startingTabSpaces) })
        );
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        this.parameters.forEach((param) => (imports = new Set([...imports, ...param.getImports()])));
        if (this.returnValue) {
            imports = new Set([...imports, ...this.returnValue.getImports()]);
        }
        this.functionBody.forEach((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        return imports;
    }
}
