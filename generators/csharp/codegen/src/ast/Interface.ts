import { CSharp } from "../csharp";
import { Access } from "./Access";
import { type ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Field } from "./Field";
import { Method } from "./Method";

export declare namespace Interface {
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
        /* The access level of the C# class */
        access: Access;
        /* Defaults to false */
        partial?: boolean;
        /* Defaults to false */
        isNestedInterface?: boolean;
        /* Any interfaces the interface inherits */
        interfaceReferences?: ClassReference[];
    }
}

export class Interface extends AstNode {
    public get name() {
        return this.reference.name;
    }
    public get namespace() {
        return this.reference.namespace;
    }
    public readonly access: Access;
    public readonly partial: boolean;
    public readonly reference: ClassReference;
    public readonly isNestedInterface: boolean;
    public readonly interfaceReferences: ClassReference[];

    private fields: Field[] = [];
    private methods: Method[] = [];

    constructor(
        { name, namespace, access, partial, isNestedInterface, interfaceReferences }: Interface.Args,
        csharp: CSharp
    ) {
        super(csharp);
        this.reference = this.csharp.classReference({
            name: name,
            namespace: namespace
        });

        this.access = access;
        this.partial = partial ?? false;
        this.isNestedInterface = isNestedInterface ?? false;
        this.interfaceReferences = interfaceReferences ?? [];
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addFields(fields: Field[]): void {
        fields.forEach((field) => this.fields.push(field));
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public write(writer: Writer): void {
        if (!this.isNestedInterface) {
            writer.writeLine(`namespace ${this.namespace};`);
            writer.newLine();
        }
        writer.write(`${this.access} `);
        if (this.partial) {
            writer.write("partial ");
        }
        writer.write("interface ");
        writer.writeLine(`${this.name}`);

        if (this.interfaceReferences.length > 0) {
            writer.write(" : ");
            this.interfaceReferences.forEach((interfaceReference, index) => {
                interfaceReference.write(writer);
                // Don't write a comma after the last interface
                if (index < this.interfaceReferences.length - 1) {
                    writer.write(", ");
                }
            });
        }
        writer.push();
        for (const field of this.fields) {
            field.write(writer);
            writer.writeLine("");
        }
        writer.dedent();

        writer.indent();
        for (const method of this.methods) {
            method.write(writer);
            writer.writeLine("");
        }
        writer.pop();
    }
}
