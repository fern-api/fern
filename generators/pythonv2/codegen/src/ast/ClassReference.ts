import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassReference {
    interface Args {
        /* The name of the Python class reference */
        name: string;
        /* The module path of the Python class reference
            For example:
            - "foo.bar" -> ["foo", "bar"]
            - "foo.bar.baz" -> ["foo", "bar", "baz"]
        */
        modulePath: string[];
    }
}

export class ClassReference extends AstNode {
    private name: string;
    private modulePath: string[];

    constructor({ name, modulePath }: ClassReference.Args) {
        super();
        this.name = name;
        this.modulePath = modulePath;
    }

    public static create(name: string, modulePath: string[]): ClassReference {
        return new ClassReference({ name, modulePath });
    }

    public write(writer: Writer): void {
        writer.write(this.name);
    }

    public getName(): string {
        return this.name;
    }

    public getModulePath(): string[] {
        return this.modulePath;
    }

    public getFullyQualifiedModulePath(): string {
        return this.modulePath.join(".");
    }

    public getFullyQualifiedName(): string {
        return [this.getFullyQualifiedModulePath(), this.name].join(".");
    }
}
