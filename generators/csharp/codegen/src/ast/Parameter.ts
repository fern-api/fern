import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Type } from "./Type";

export declare namespace Parameter {
    interface Args {
        /* The name of the method */
        name: string;
        /* The access of the method */
        type: Type;
        /* Docs for the parameter */
        docs: string | undefined;
    }
}

export class Parameter extends AstNode {
    constructor(private readonly args: Parameter.Args) {
        super();
    }

    public write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
