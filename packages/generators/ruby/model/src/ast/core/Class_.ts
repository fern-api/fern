import { AstNode } from "../AstNode";
import { Expression } from "./Expression";
import { Function_ } from "./Function_";
import { Variable } from "./Variable";

export enum RubyClass {
    STRING = "String",
    INTEGER = "Integer",
    OBJECT = "Object",
    OPENSTRUCT = "OpenStruct",
    DATETIME = "DateTime",
    BOOLEAN = "Boolean",
    NIL = "nil",
    VOID = "void",
}

export class Class_ extends AstNode {
    public location: string | undefined;
    public name: string;
    public moduleBreadcrumbs: string[];
    public extendedClasses: Class_[];

    public properties: Variable[];
    public functions: Function_[];
    public expressions: Expression[];
    public includeInitializer: boolean;

    constructor(name: string, moduleBreadcrumbs: string[], extendedClasses: Class_[] = [], properties: Variable[] = [], functions: Function_[] = [], expressions: Expression[] = [], includeInitializer = true, documentation?: string, location?: string) {
        super(documentation);
        this.location = location;
        this.name = name;
        this.moduleBreadcrumbs = moduleBreadcrumbs;
        this.extendedClasses = extendedClasses;
    
        this.properties = properties;
        this.functions = functions;
        this.expressions = expressions;
        this.includeInitializer = includeInitializer;
    }

    // When invoking a class
    public writeInvokation(): string {
        // Write the .new invokation, a bit different from normal functions
        // as the function is called "initialize", but invoked as "new"
        return "";
    }

    // When writing the definition
    public writeInternal(startingTabSpaces: number): string {
        // Write docstring
        // Write accessors
        // Write initializer
        // Write function signature
        // Write function body
        return "";
    }
}
