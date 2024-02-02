import { BLOCK_END } from "../../utils/RubyConstants";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";
import { Property } from "../Property";
import { Yardoc } from "../Yardoc";
import { ClassReference } from "./ClassReference";

export declare namespace Class_ {
    export interface Init extends AstNode.Init {
        classReference: ClassReference;
        properties?: Property[];
        functions?: Function_[];
        expressions?: Expression[];
        includeInitializer?: boolean;
        initializerOverride?: Function_;
    }
}

// TODO: ClassReferences should probably move to a get function
// on the AstNode object
export class Class_ extends AstNode {
    // The reference for the current class (e.g. self)
    // TODO: this should probably just be a name and not a reference
    public classReference: ClassReference;

    public properties: Property[];
    public functions: Function_[];
    public expressions: Expression[];

    public initializer?: Function_;

    constructor({
        classReference,
        initializerOverride,
        properties = [],
        functions = [],
        expressions = [],
        includeInitializer = true,
        ...rest
    }: Class_.Init) {
        super(rest);
        this.classReference = classReference;

        this.properties = properties;

        if (includeInitializer) {
            this.initializer = new Function_({
                name: "initialize",
                parameters: properties.map((prop) => prop.toParameter({})),
                returnValue: classReference,
                functionBody: properties.map((prop) => {
                    const yardoc = new Yardoc({ reference: { name: "typeReference", type: prop } });
                    return new Expression({
                        leftSide: prop.toVariable(),
                        rightSide: prop.name,
                        isAssignment: true,
                        yardoc
                    });
                }),
                invocationName: "new"
            });
            functions = [this.initializer, ...functions];
        } else if (initializerOverride !== undefined) {
            this.initializer = initializerOverride;
            functions = [this.initializer, ...functions];
        }
        this.functions = functions;
        this.expressions = expressions;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.documentation, templateString: "# %s", startingTabSpaces });
        this.addText({ stringContent: this.classReference.name, templateString: "class %s", startingTabSpaces });
        const classVariableAccessors =
            this.properties.length > 0
                ? `attr_reader ${this.properties.map((prop) => prop.write({})).join(", ")}`
                : undefined;
        this.addText({
            stringContent: classVariableAccessors,
            startingTabSpaces: this.tabSizeSpaces + startingTabSpaces
        });
        this.expressions.map((exp) =>
            this.addText({ stringContent: exp.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces }) })
        );
        this.functions.map((fun) =>
            this.addText({ stringContent: fun.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces }) })
        );
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        this.functions.forEach((fun) => (imports = new Set([...imports, ...fun.getImports()])));
        this.properties.forEach((prop) => (imports = new Set([...imports, ...prop.getImports()])));
        this.expressions.forEach((exp) => (imports = new Set([...imports, ...exp.getImports()])));

        // Do not import self
        return new Set([...imports].filter((i) => i !== this.classReference.import_));
    }
}
