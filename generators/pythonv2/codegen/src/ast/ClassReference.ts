import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace ClassReference {
    interface Args {
        /* The name of the Python class reference */
        name: string;
        /* The module path of the Python class reference
            For example:
            - "foo.bar" -> ["foo", "bar"]
            - "foo.bar.baz" -> ["foo", "bar", "baz"]
            - "..foo.bar" -> ["..","foo", "bar"]
        */
        modulePath?: string[];
        /* The generic types of the class reference */
        genericTypes?: Type[];
    }
}

export class ClassReference extends AstNode {
    private name: string;
    private modulePath: string[];
    private genericTypes: Type[];

    constructor({ name, modulePath, genericTypes }: ClassReference.Args) {
        super();
        this.name = name;
        this.genericTypes = genericTypes ?? [];

        if (modulePath) {
            if (modulePath.slice(1).some((part) => part.startsWith("."))) {
                throw new Error("Only the first item in modulePath may start with a '.'");
            }
            if (modulePath[0]?.startsWith(".") && modulePath[0]?.split("").some((char) => char !== ".")) {
                throw new Error("If the first item in modulePath starts with '.', it must only contain '.' characters");
            }
            this.modulePath = modulePath;
        } else {
            this.modulePath = [];
        }
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
        if (this.modulePath.length === 0) {
            return "";
        }

        let prefix = "";
        let startIndex = 0;

        // Handle relative imports
        while (startIndex < this.modulePath.length && this.modulePath[startIndex]?.startsWith(".")) {
            prefix += this.modulePath[startIndex];
            startIndex++;
        }

        // Join the remaining parts of the module path
        const remainingPath = this.modulePath.slice(startIndex).join(".");

        // Combine the prefix and the remaining path
        return prefix + (prefix && remainingPath ? "." : "") + remainingPath;
    }

    public getFullyQualifiedName(): string {
        return [this.getFullyQualifiedModulePath(), this.name].join(".");
    }
}
