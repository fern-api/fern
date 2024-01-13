import { BLOCK_END } from "../../utils/Constants";
import { AstNode } from "../AstNode";
import { ClassReference } from "../classes/ClassReference";
import { Expression } from "../expressions/Expression";
import { Function_ } from "../functions/Function_";
import { Property } from "../Property";
import { Yardoc } from "../Yardoc";

export declare namespace Class_ {
    export interface Init extends AstNode.Init {
        classReference: ClassReference;
        extendedClasses?: ClassReference[];
        properties?: Property[];
        functions?: Function_[];
        expressions?: Expression[];
        includeInitializer?: boolean;
    }
}

// TODO: ClassReferences should probably move to a get function
// on the AstNode object
export class Class_ extends AstNode {
    // The reference for the current class (e.g. self)
    public classReference: ClassReference;
    public extendedClasses: ClassReference[];

    public properties: Property[];
    public functions: Function_[];
    public expressions: Expression[];

    constructor({
        classReference,
        extendedClasses = [],
        properties = [],
        functions = [],
        expressions = [],
        includeInitializer = true,
        ...rest
    }: Class_.Init) {
        super(rest);
        this.classReference = classReference;
        this.extendedClasses = extendedClasses;

        this.properties = properties;
        if (includeInitializer) {
            const initializer = new Function_({
                name: "initialze",
                parameters: properties.map((prop) => prop.toParameter()),
                returnValue: classReference,
                functionBody: properties.map((prop) => {
                    const yardoc = new Yardoc({ reference: { name: "typeReference", type: prop } });
                    return new Expression({
                        leftSide: prop.toVariable(),
                        rightSide: prop.name,
                        isAssignment: true,
                        yardoc
                    });
                })
            });
            functions = [initializer, ...functions];
        }
        this.functions = functions;
        this.expressions = expressions;
    }

    public writeInternal(startingTabSpaces: number): string {
        const classVariableAccessors = `attr_accessor ${this.properties.map(prop => prop.writeInternal(0))}`;
        return this.writePaddedString(
            startingTabSpaces,
            `
${this.documentation}
class ${this.classReference.name}${this.extendedClasses.length > 0 && "< " + this.extendedClasses.map(cl => cl.name).join(", ")}
${this.writePaddedString(this.tabSizeSpaces + startingTabSpaces, classVariableAccessors)}
${this.expressions.map(exp => exp.writeInternal(this.tabSizeSpaces + startingTabSpaces))}
${this.functions.map(fun => fun.writeInternal(this.tabSizeSpaces + startingTabSpaces))}
${BLOCK_END}
`);
    }
}
