import { AstNode } from "../AstNode";
import { Class_, RubyClass } from "./Class_";
import { Variable } from "./Variable";

export declare namespace Parameter {
    export interface Init extends AstNode.Init {
        name: string;
        type: Class_ | RubyClass;
        defaultValue?: Variable;
    }
}

export class Parameter extends AstNode {
    public name: string;
    public type: Class_ | RubyClass;
    // TODO: deal with constants
    public defaultValue: Variable | undefined;

    constructor({ name, type, defaultValue, ...rest }: Parameter.Init) {
        super(rest);
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue;
    }

    public writeInternal(startingTabSpaces: number): string {
        return `${this.name}:${this.defaultValue !== undefined && " " + this.defaultValue.write(0)}`;
    }
}
