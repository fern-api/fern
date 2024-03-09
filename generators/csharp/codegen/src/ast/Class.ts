import { FernFilepath } from "@fern-fern/ir-sdk/api";
import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassInstantiation } from "./ClassInstantiation";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Field } from "./Field";
import { Interface } from "./Interface";
import { Method } from "./Method";

export declare namespace Class {
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
        /* The access level of the C# class */
        access: Access;
        /* Defaults to false */
        sealed?: boolean;
        /* Defaults to false */
        partial?: boolean;
        /* The class to inherit from if any */
        parentClassReference?: ClassReference;
        /* Any interfaces the class extends */
        interfaceReferences?: ClassReference[];
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly access: Access;
    public readonly sealed: boolean;
    public readonly partial: boolean;
    public readonly reference: ClassReference;
    public readonly parentClassReference: ClassReference | undefined;
    public readonly interfaceReferences: ClassReference[];

    private fields: Field[] = [];
    private methods: Method[] = [];
    private nestedClasses: Class[] = [];
    private nestedInterfaces: Interface[] = [];

    constructor({ name, namespace, access, sealed, partial, parentClassReference, interfaceReferences }: Class.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.access = access;
        this.sealed = sealed ?? false;
        this.partial = partial ?? false;

        this.parentClassReference = parentClassReference;
        this.interfaceReferences = interfaceReferences ?? [];

        this.reference = new ClassReference({
            name: this.name,
            namespace: this.namespace
        });
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public addNestedClass(subClass: Class): void {
        this.nestedClasses.push(subClass);
    }

    public addNestedInterface(subInterface: Interface): void {
        this.nestedInterfaces.push(subInterface);
    }

    public write(writer: Writer): void {
        writer.writeLine(`namespace ${this.namespace}`);
        writer.newLine();
        writer.write(`${this.access} `);
        if (this.sealed) {
            writer.write("sealed ");
        }
        if (this.partial) {
            writer.write("partial ");
        }
        writer.write("class ");
        writer.writeLine(`${this.name}`);
        if (this.parentClassReference != null || this.interfaceReferences.length > 0) {
            writer.write(" : ");
            if (this.parentClassReference != null) {
                this.parentClassReference.write(writer);
                if (this.interfaceReferences.length > 0) {
                    writer.write(", ");
                }
            }
            this.interfaceReferences.forEach((interfaceReference, index) => {
                interfaceReference.write(writer);
                // Don't write a comma after the last interface
                if (index < this.interfaceReferences.length - 2) {
                    writer.write(", ");
                }
            });
        }
        writer.writeLine("{");

        writer.indent();
        for (const field of this.fields) {
            field.write(writer);
            writer.writeLine("");
        }
        writer.dedent();

        // TODO(dsinghvi): add support for methods

        // TODO(dsinghvi): add support for subclasses

        writer.writeLine("}");
    }

    public getFields(): Field[] {
        return this.fields;
    }

    public getInitializer(args: Map<Field, CodeBlock>): ClassInstantiation {
        return new ClassInstantiation({
            classReference: this.reference,
            arguments: args
        });
    }

    public getInitializerFromExample(example: Map<string, unknown>): ClassInstantiation {
        const args = new Map<Field, CodeBlock>();
        for (const field of this.fields) {
            const value = example.get(field.name);
            if (value !== undefined) {
                // TODO: actually handle these examples
                args.set(field, new CodeBlock({ value: value as string }));
            }
        }
        return new ClassInstantiation({
            classReference: this.reference,
            arguments: args
        });
    }

    public static getNamespaceFromFernFilepath(rootNamespace: string, fernFilePath: FernFilepath): string {
        return [rootNamespace, ...fernFilePath.packagePath.map((path) => path.pascalCase.safeName)].join(".");
    }
}
