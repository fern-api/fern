import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassReference {
    interface Args {
        /* The name of the Java class */
        name: string;
        /* The package name of the Java class */
        packageName: string;
        /* Force the class reference to be fully qualified */
        fullyQualified?: boolean;
    }
}

export class ClassReference extends AstNode {
    public readonly name: string;
    public readonly packageName: string;
    public readonly fullyQualified: boolean;

    constructor({ name, packageName, fullyQualified }: ClassReference.Args) {
        super();
        this.name = name;
        this.packageName = packageName;
        this.fullyQualified = fullyQualified ?? false;
    }

    public write(writer: Writer): void {
        writer.addImport(`${this.packageName}.${this.name}`);
        if (this.fullyQualified) {
            writer.write(`${this.packageName}.${this.name}`);
            return;
        }
        writer.write(this.name);
    }
}
