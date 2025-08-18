import { AstNode } from "./core/AstNode";
import { Type } from "./Type";
import { TypeParameter } from "./TypeParameter";

export declare namespace Parameter {
    interface Args {
        /* The name of this parameter. */
        name: string;
        /* The type of this parameter. */
        type?: Type | TypeParameter;
        /* If this parameter is optional. */
        optional?: boolean;
        /* The docs for this parameter. */
        docs?: string;
    }
}

export abstract class Parameter extends AstNode {
    public readonly name: string;
    public readonly type: Type | TypeParameter;
    public readonly optional: boolean;
    public readonly docs?: string;

    constructor({ name, type, optional, docs }: Parameter.Args) {
        super();
        this.name = name;
        this.type = type ?? Type.untyped();
        this.optional = optional ?? false;
        this.docs = docs;
    }
}
