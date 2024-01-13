import { AstNode } from "./AstNode";
import { ClassReference, NilValue } from "./classes/ClassReference";
import { Variable } from "./Variable";

export declare namespace Parameter {
    export interface Init extends AstNode.Init {
        name: string;
        type: ClassReference;
        defaultValue?: Variable | string;
        isOptional?: boolean;
    }
}

export class Parameter extends AstNode {
    public name: string;
    public type: ClassReference;
    // TODO: deal with constants in a more structured way.
    public defaultValue: Variable | string | undefined;

    constructor({ name, type, defaultValue, isOptional = false, ...rest }: Parameter.Init) {
        super(rest);
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue ?? (isOptional ? NilValue : undefined);
    }

    public writeInternal(startingTabSpaces: number): string {
        const defaultString =
            this.defaultValue instanceof Variable ? this.defaultValue.writeInternal(0) : this.defaultValue;
        return `${this.name}:${this.defaultValue !== undefined && " " + defaultString}`;
    }
}
