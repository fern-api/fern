import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Type } from "./Type";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type: Type;
        /* Docs for the parameter */
        docs: string | undefined;
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    constructor(private readonly args: Parameter.Args) {
        super();
        this.name = args.name;
    }

    public write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
