import { BLOCK_END } from "../../utils/RubyConstants";
import { Argument } from "../Argument";
import { Import } from "../Import";
import { Property } from "../Property";
import { Yardoc } from "../Yardoc";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { ClassReference } from "./ClassReference";

export declare namespace Class_ {
    export interface Init extends AstNode.Init {
        classReference: ClassReference;
        properties?: Property[];
        protectedProperties?: Property[];
        functions?: Function_[];
        expressions?: Expression[];
        includeInitializer?: boolean;
        initializerAdditionalExpressions?: Expression[];
        initializerOverride?: Function_;
        children?: AstNode | AstNode[];
        shouldOmitOptionalFieldsInInitializer?: boolean;
    }
}

// TODO: ClassReferences should probably move to a get function
// on the AstNode object
export class Class_ extends AstNode {
    // The reference for the current class (e.g. self)
    // TODO: this should probably just be a name and not a reference
    public classReference: ClassReference;

    public properties: Property[];
    public protectedProperties: Property[];
    public functions: Function_[];
    public expressions: Expression[];

    public initializer?: Function_;

    public children: AstNode[];

    private yardoc: Yardoc | undefined;

    constructor({
        classReference,
        initializerOverride,
        children,
        properties = [],
        protectedProperties = [],
        functions = [],
        expressions = [],
        includeInitializer = true,
        shouldOmitOptionalFieldsInInitializer = false,
        initializerAdditionalExpressions = [],
        ...rest
    }: Class_.Init) {
        super(rest);
        this.classReference = classReference;

        this.properties = [...properties, ...protectedProperties];
        this.protectedProperties = protectedProperties;

        if (includeInitializer) {
            this.initializer = new Function_({
                name: "initialize",
                parameters: properties.map((prop) =>
                    prop.toParameter({ shouldOmitOptional: shouldOmitOptionalFieldsInInitializer })
                ),
                returnValue: classReference,
                functionBody: [
                    ...properties.map((prop) => {
                        return new Expression({
                            leftSide: prop.toVariable(),
                            rightSide: prop.name,
                            isAssignment: true
                        });
                    }),
                    ...initializerAdditionalExpressions
                ],
                invocationName: "new"
            });
            functions = [this.initializer, ...functions];
        } else if (initializerOverride !== undefined) {
            this.initializer = initializerOverride;
            functions = [this.initializer, ...functions];
        }
        this.functions = functions;
        this.expressions = expressions;
        this.children = children instanceof AstNode ? [children] : (children ?? []);

        this.yardoc =
            this.documentation != null
                ? new Yardoc({ reference: { name: "universal", documentation: this.documentation } })
                : undefined;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.yardoc?.write({ startingTabSpaces }) });
        this.addText({ stringContent: this.classReference.name, templateString: "class %s", startingTabSpaces });

        for (const prop of this.properties) {
            const yardoc = new Yardoc({ reference: { name: "typeReference", type: prop } });
            this.addText({ stringContent: yardoc.write({ startingTabSpaces }) });
            this.addText({
                stringContent: prop.write({}),
                startingTabSpaces: this.tabSizeSpaces + startingTabSpaces,
                templateString: "attr_reader %s"
            });
        }
        const protectedClassVariableAccessors =
            this.protectedProperties.length > 0
                ? `protected ${this.protectedProperties.map((prop) => prop.write({})).join(", ")}`
                : undefined;
        this.addText({
            stringContent: protectedClassVariableAccessors,
            startingTabSpaces: this.tabSizeSpaces + startingTabSpaces
        });

        this.addNewLine();
        this.expressions.map((exp) =>
            this.addText({ stringContent: exp.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces }) })
        );
        this.addNewLine();

        this.functions.map((fun) =>
            this.addText({ stringContent: fun.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces }) })
        );
        this.children.map((c) =>
            this.addText({ stringContent: c.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces }) })
        );
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        this.functions.forEach((fun) => (imports = new Set([...imports, ...fun.getImports()])));
        this.properties.forEach((prop) => (imports = new Set([...imports, ...prop.getImports()])));
        this.expressions.forEach((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        this.children.forEach((child) => (imports = new Set([...imports, ...child.getImports()])));
        // Do not import self
        return new Set([...imports].filter((i) => i !== this.classReference.import_));
    }

    public generateSnippet(): string | AstNode | undefined {
        return new FunctionInvocation({
            baseFunction: this.initializer,
            onObject: this.classReference.qualifiedName,
            arguments_: this.initializer?.parameters
                .map((param) => {
                    const parameterValue = param.example;
                    return parameterValue != null ? param.toArgument(parameterValue) : undefined;
                })
                .filter((arg): arg is Argument => arg != null)
        });
    }
}
