import { Type } from "./Type";
import { TypedAstNode } from "./core/TypedAstNode";

export declare namespace Parameter {
    interface Args {
        /* The name of this parameter. */
        name: string;
        /* The type of this parameter. */
        type?: Type;
    }
}

export abstract class Parameter extends TypedAstNode {
    public readonly name: string;
    public readonly type: Type;

    constructor({ name, type }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type ?? Type.untyped();
    }
}
