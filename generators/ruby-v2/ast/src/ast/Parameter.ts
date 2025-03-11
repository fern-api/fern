import { Type } from "./Type";
import { TypedAstNode } from "./core/TypedAstNode";

export declare namespace Parameter {
    interface Args {
        /* The name of this parameter. */
        name: string;
        /* The type of this parameter. */
        type?: Type;
        /* If this parameter is optional. */
        optional?: boolean;
    }
}

export abstract class Parameter extends TypedAstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly optional: boolean;

    constructor({ name, type, optional }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type ?? Type.untyped();
        this.optional = optional ?? false;
    }
}
