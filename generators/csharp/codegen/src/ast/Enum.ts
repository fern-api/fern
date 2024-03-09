import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Annotation } from "./Annotation";
import { ClassReference } from "./ClassReference";

export declare namespace Enum {
    interface Args {
        /* The name of the C# enum */
        name: string;
        /* The namespace of the C# enum*/
        namespace: string;
        /* The access level of the C# enum */
        access: Access;
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

    private fields: Enum._Member[] = [];

    constructor({ name, namespace, access }: Enum.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.access = access;

        this.reference = new ClassReference({
            name: this.name,
            namespace: this.namespace
        });
    }

    public addMember(field: Enum.Member): void {
        this.fields.push({
            name: field.name,
            value: new Annotation({
                reference: new ClassReference({
                    name: "EnumMember",
                    namespace: "System.Text.Json.Serialization"
                }),
                argument: `Value ="${field.value}"`
            })
        });
    }

    public write(writer: Writer): void {
        writer.writeLine(`namespace ${this.namespace}`);
        writer.newLine();
        writer.write(`${this.access} `);
        writer.write("enum ");
        writer.writeLine(`${this.name}`);
        writer.writeLine("{");

        writer.indent();
        for (const field of this.fields) {
            writer.write("[");
            field.value.write(writer);
            writer.writeLine("]");
            writer.write(field.name);
        }
        writer.dedent();
        writer.writeLine("}");
    }
}
