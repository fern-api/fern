import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Annotation } from "./Annotation";
import { Type } from "./Type";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* Whether the field has a getter method */
        get: boolean;
        /* Whether the field has a init method */
        init?: boolean;
        /* The access level of the method */
        access: Access;
        /* Field annotations */
        annotations: Annotation[];
    }
}

/* A C# field */
export class Field extends AstNode {
    constructor(private readonly args: Field.Args) {
        super();
    }

    protected write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
