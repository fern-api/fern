import { ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";

import { BLOCK_END } from "../../utils/RubyConstants";
import { Argument } from "../Argument";
import { ExampleGenerator } from "../ExampleGenerator";
import { Import } from "../Import";
import { Parameter } from "../Parameter";
import { Yardoc } from "../Yardoc";
import { ClassReference, ClassReferenceFactory } from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { AstNode } from "../core/AstNode";
import { FunctionInvocation } from "./FunctionInvocation";

export declare namespace Function_ {
    export interface Init extends AstNode.Init {
        name: string;
        functionBody: AstNode[];
        // The package path represents the route to the submodule in which the
        // function exists. Note for most external functions this will be empty.
        packagePath?: string[];
        parameters?: Parameter[];
        isAsync?: boolean;
        isStatic?: boolean;
        returnValue?: ClassReference | ClassReference[];
        flattenedProperties?: Map<TypeId, ObjectProperty[]>;
        crf?: ClassReferenceFactory;
        eg?: ExampleGenerator;
        invocationName?: string;

        skipExample?: boolean;
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

    private packagePath: string[];
    private skipExample: boolean;

    constructor({
        name,
        functionBody,
        flattenedProperties,
        crf,
        eg,
        packagePath = [],
        parameters = [],
        isAsync = false,
        isStatic = false,
        skipExample = false,
        returnValue,
        invocationName,
        ...rest
    }: Function_.Init) {
        super(rest);
        this.name = name;
        this.parameters = parameters;
        this.packagePath = packagePath;
        this.returnValue = (returnValue instanceof ClassReference ? [returnValue] : returnValue) ?? [];
        this.functionBody = functionBody;
        this.isAsync = isAsync;
        this.isStatic = isStatic;
        this.invocationName = invocationName;
        this.skipExample = skipExample;

        this.yardoc = new Yardoc({
            reference: {
                name: "docString",
                parameters,
                returnValue: this.returnValue,
                documentation: this.documentation,
                baseFunction: this
            },
            eg,
            crf,
            flattenedProperties
        });
    }

    private writeParameters(): string | undefined {
        return this.parameters.length > 0 ? `(${this.parameters.map((a) => a.write({})).join(", ")})` : undefined;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({
            stringContent: this.yardoc.write({ startingTabSpaces })
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

    public getInvocationName(fullPath = true): string {
        return this.invocationName != null
            ? this.invocationName
            : fullPath
              ? [...this.packagePath, this.name].join(".")
              : this.name;
    }

    public generateSnippet(clientName: string): AstNode | string | undefined {
        return this.skipExample
            ? undefined
            : new FunctionInvocation({
                  baseFunction: this,
                  onObject: clientName,
                  arguments_: this.parameters
                      .map((param) => {
                          const parameterValue = param.example;
                          return parameterValue != null ? param.toArgument(parameterValue) : undefined;
                      })
                      .filter((arg): arg is Argument => arg != null)
              });
    }
}
