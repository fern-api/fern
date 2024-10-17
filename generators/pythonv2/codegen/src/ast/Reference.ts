import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace Reference {
    interface Args {
        /* The name of the reference */
        name: string;
        /* The module path of the reference
            For example:
            - "foo.bar" -> ["foo", "bar"]
            - "foo.bar.baz" -> ["foo", "bar", "baz"]
        */
        modulePath?: string[];
        /* The generic types of the reference */
        genericTypes?: Type[];
    }
}

export class Reference extends AstNode {
    private name: string;
    private modulePath: string[];
    private genericTypes: Type[];

    constructor({ name, modulePath, genericTypes }: Reference.Args) {
        super();
        this.name = name;
        this.modulePath = modulePath ?? [];
        this.genericTypes = genericTypes ?? [];
    }

    public write(writer: Writer): void {
        writer.write(this.name);

        if (this.genericTypes.length > 0) {
            writer.write("[");
            this.genericTypes.forEach((genericType, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                genericType.write(writer);
            });
            writer.write("]");
        }
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
