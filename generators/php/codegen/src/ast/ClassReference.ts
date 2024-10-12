import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { writeArguments } from "./utils/writeArguments";

export declare namespace ClassReference {
    interface Args {
        /* The name of the PHP class */
        name: string;
        /* The namespace of the PHP class */
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

    public write(writer: Writer): void {
        writer.addReference(this);
        if (writer.requiresInlineFullQualification(this)) {
            writer.write(`\\${writer.toImportString(this)}`);
        } else {
            writer.write(`${this.name}`);
        }
    }
}
