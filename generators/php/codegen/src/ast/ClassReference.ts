import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassReference {
    interface Args {
        /* The name of the PHP class */
        name: string;
        /* The namespace of the PHP class */
        namespace: string;
        /* Whether or not the referenced class is an enum */
        isEnum?: boolean;
    }
}

export class ClassReference extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly isEnum: boolean;

    constructor({ name, namespace, isEnum }: ClassReference.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.isEnum = isEnum ?? false;
    }

    public write(writer: Writer): void {
        writer.addReference(this);
        writer.write(`${this.name}`);
    }
}
