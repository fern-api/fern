import { AstNode } from "./AstNode";
import { ClassReference } from "./ClassReference";
import { Expression } from "./Expression";
import { Function_ } from "./Function_";
import { Property } from "./Property";

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
    public includeInitializer: boolean;

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
        this.functions = functions;
        this.expressions = expressions;
        this.includeInitializer = includeInitializer;
    }

    // When writing the definition
    public writeInternal(startingTabSpaces: number): string {
        // Write imports from properties, extended classes and function arguments
        // Write modules and class definition
        // Write docstring
        // Write accessors
        // Write initializer
        // Write function signature
        // Write function body
        return "";
    }
}
