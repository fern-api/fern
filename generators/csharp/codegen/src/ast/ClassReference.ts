import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";

export declare namespace ClassReference {
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
    }
}

export class ClassReference extends AstNode {
    public readonly name: string;
    public readonly namespace: string;

    constructor({ name, namespace }: ClassReference.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
    }

    protected write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
