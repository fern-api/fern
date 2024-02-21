import { ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";
import { BLOCK_END } from "../../utils/RubyConstants";
import { ClassReference, ClassReferenceFactory } from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { AstNode } from "../core/AstNode";
import { Import } from "../Import";
import { Parameter } from "../Parameter";
import { Yardoc } from "../Yardoc";

export declare namespace Function_ {
    export interface Init extends AstNode.Init {
        name: string;
        functionBody: AstNode[];
        parameters?: Parameter[];
        isAsync?: boolean;
        isStatic?: boolean;
        returnValue?: ClassReference | ClassReference[];
        flattenedProperties?: Map<TypeId, ObjectProperty[]>;
        crf?: ClassReferenceFactory;
        invocationName?: string;
    }
}
export class Function_ extends AstNode {
    public name: string;

    public parameters: Parameter[];
    // Could make this an Expression, but returns are specific to functions, so might leave it here for now
    public returnValue: ClassReference[];
    public functionBody: AstNode[];
    public isAsync: boolean;
    public isStatic: boolean;
    public yardoc: Yardoc;

    public invocationName: string | undefined;

    constructor({
        name,
        functionBody,
        flattenedProperties,
        crf,
        parameters = [],
        isAsync = false,
        isStatic = false,
        returnValue,
        invocationName,
        ...rest
    }: Function_.Init) {
        super(rest);
        this.name = name;
        this.parameters = parameters;
        this.returnValue = (returnValue instanceof ClassReference ? [returnValue] : returnValue) ?? [];
        this.functionBody = functionBody;
        this.isAsync = isAsync;
        this.isStatic = isStatic;
        this.invocationName = invocationName;

        this.yardoc = new Yardoc({
            reference: { name: "docString", parameters, returnValue: this.returnValue },
            crf,
            flattenedProperties
        });
    }

    private writeParameters(): string | undefined {
        return this.parameters.length > 0 ? `(${this.parameters.map((a) => a.write({})).join(", ")})` : undefined;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.documentation?.forEach((doc) =>
            this.addText({ stringContent: doc, templateString: "# %s", startingTabSpaces })
        );
        this.addText({
            stringContent: this.yardoc.write({ startingTabSpaces }),
            templateString: this.documentation !== undefined && this.documentation.length > 0 ? "#\n%s" : undefined,
            startingTabSpaces: this.documentation !== undefined && this.documentation.length > 0 ? startingTabSpaces : 0
        });
        this.addText({
            stringContent: this.isStatic ? `self.${this.name}` : this.name,
            templateString: "def %s",
            startingTabSpaces
        });
        this.addText({ stringContent: this.writeParameters(), appendToLastString: true, startingTabSpaces });
        this.functionBody.map((exp) =>
            this.addText({ stringContent: exp.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces }) })
        );
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        this.parameters.forEach((param) => (imports = new Set([...imports, ...param.getImports()])));
        this.returnValue.forEach((rv) => (imports = new Set([...imports, ...rv.getImports()])));

        this.functionBody.forEach((exp) => {
            if (exp instanceof Class_) {
                return;
            }
            imports = new Set([...imports, ...exp.getImports()]);
        });
        return imports;
    }
}
