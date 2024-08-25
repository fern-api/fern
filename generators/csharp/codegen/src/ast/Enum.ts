import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { ENUM_MEMBER } from "./dependencies/System";

export declare namespace Enum {
    interface Args {
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

export class Enum extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly access: Access;
    public readonly reference: ClassReference;

    private annotations: Annotation[];
    private fields: Enum._Member[] = [];

    constructor({ name, namespace, access, annotations }: Enum.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.access = access;

        this.annotations = annotations ?? [];

        this.reference = new ClassReference({
            name: this.name,
            namespace: this.namespace
        });
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public addMember(field: Enum.Member): void {
        this.fields.push({
            name: field.name,
            value: new Annotation({
                reference: ENUM_MEMBER,
                argument: `Value = "${field.value}"`
            })
        });
    }

    public write(writer: Writer): void {
        writer.writeLine(`namespace ${this.namespace};`);
        writer.newLine();

        if (this.annotations.length > 0) {
            writer.write("[");
            for (const annotation of this.annotations) {
                annotation.write(writer);
            }
            writer.writeLine("]");
        }

        writer.write(`${this.access} `);
        writer.write("enum ");
        writer.writeLine(`${this.name}`);
        writer.writeLine("{");

        writer.indent();
        this.fields.forEach((field, index) => {
            writer.write("[");
            field.value.write(writer);
            writer.writeLine("]");
            writer.write(field.name);
            if (index < this.fields.length - 1) {
                writer.writeLine(",");
                writer.newLine();
            }
        });
        writer.writeNewLineIfLastLineNot();
        writer.dedent();
        writer.writeLine("}");
    }
}
