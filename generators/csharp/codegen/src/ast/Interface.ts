import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";
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
    }
}

export class Interface extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly access: Access;
    public readonly partial: boolean;
    public readonly reference: ClassReference;

    private fields: Field[] = [];
    private methods: Method[] = [];

    constructor({ name, namespace, access, partial }: Interface.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.access = access;
        this.partial = partial ?? false;

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

    public write(writer: Writer): void {
        writer.writeLine(`namespace ${this.namespace}`);
        writer.newLine();
        writer.write(`${this.access} `);
        if (this.partial) {
            writer.write("partial ");
        }
        writer.write("interface ");
        writer.writeLine(`${this.name}`);
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
}
