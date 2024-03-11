import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassInstantiation } from "./ClassInstantiation";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Field } from "./Field";
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
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly access: Access;
    public readonly sealed: boolean;
    public readonly partial: boolean;
    public readonly reference: ClassReference;

    private fields: Field[] = [];
    private methods: Method[] = [];

    constructor({ name, namespace, access, sealed, partial }: Class.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.access = access;
        this.sealed = sealed ?? false;
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
        if (this.sealed) {
            writer.write("sealed ");
        }
        if (this.partial) {
            writer.write("partial ");
        }
        writer.write("class ");
        writer.writeLine(`${this.name}`);
        writer.writeLine("{");

        writer.indent();
        for (const field of this.fields) {
            field.write(writer);
            writer.writeLine("");
        }
        writer.dedent();

        // TODO(dsinghvi): add support for methods

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
}
