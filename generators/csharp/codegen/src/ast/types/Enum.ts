import { type Generation } from "../../context/generation-info";
import { Node } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Access } from "../language/Access";
import { Annotation } from "../language/Annotation";
import { type ClassReference } from "./ClassReference";

export declare namespace Enum {
    interface Args extends Node.Args {
        /* The name of the C# enum */
        name: string;
        /* The namespace of the C# enum*/
        namespace: string;
        /* The access level of the C# enum */
        access: Access;
        /* Enum declaration annotations */
        annotations?: Annotation[];
    }

    interface Member {
        /* The name of the enum field */
        name: string;
        /* The value of the enum field */
        value: string;
    }

    interface _Member {
        /* The name of the enum field */
        name: string;
        /* The value of the enum field */
        value: Annotation;
    }
}

export class Enum extends Node {
    public get name() {
        return this.reference.name;
    }
    public get namespace() {
        return this.reference.namespace;
    }

    public readonly access: Access;
    public readonly reference: ClassReference;

    private annotations: Annotation[];
    private fields: Enum._Member[] = [];

    constructor({ name, namespace, access, annotations, origin }: Enum.Args, generation: Generation) {
        super(origin, generation);
        this.reference = this.csharp.classReference({
            name: name,
            namespace: namespace,
            origin
        });

        this.access = access;
        this.annotations = annotations ?? [];
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public addMember(field: Enum.Member): void {
        this.fields.push({
            name: field.name,
            value: this.csharp.annotation({
                reference: this.extern.System.Runtime.Serialization.EnumMember,
                argument: this.csharp.codeblock((writer) => {
                    writer.write("Value = ");
                    writer.writeNode(this.csharp.string_({ string: field.value }));
                })
            })
        });
    }

    public write(writer: Writer): void {
        writer.writeLine(`namespace ${this.namespace};`);
        writer.newLine();

        for (const annotation of this.annotations) {
            annotation.write(writer);
        }
        writer.writeNewLineIfLastLineNot();

        writer.write(`${this.access} `);
        writer.write("enum ");
        writer.writeLine(`${this.name}`);
        writer.pushScope();

        this.fields.forEach((field, index) => {
            field.value.write(writer);
            writer.write(field.name);
            if (index < this.fields.length - 1) {
                writer.writeLine(",");
                writer.newLine();
            }
        });
        writer.writeNewLineIfLastLineNot();
        writer.popScope();
    }
}
