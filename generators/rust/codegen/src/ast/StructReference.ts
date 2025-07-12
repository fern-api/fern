import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace StructReference {
    interface Args {
        /* The name of the PHP class */
        name: string;
        /* The namespace of the PHP class */
        namespace: string;
        generics?: Type[];
    }
}

export class StructReference extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly generics?: Type[];
    private fullyQualified: boolean;

    constructor({ name, namespace, generics }: StructReference.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.generics = generics;
        this.fullyQualified = false;
    }

    public requireFullyQualified(): void {
        this.fullyQualified = true;
    }

    public write(writer: Writer): void {
        writer.addReference(this);
        const refString = this.fullyQualified ? `\\${this.namespace}\\${this.name}` : this.name;
        writer.write(`${refString}`);
    }
}
