import { type Generation } from "../../context/generation-info.js";
import { Node } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";
import { Access } from "../language/Access.js";
import { Annotation } from "../language/Annotation.js";
import { type ClassReference } from "./ClassReference.js";

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
        /* The wire value string of the enum field */
        wireValue: string;
        /* The annotation for the enum field */
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
    private generateSerializer = false;
    private serializerClassReference: ClassReference | undefined;

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

    public addAnnotation(annotation: Annotation): void {
        this.annotations.push(annotation);
    }

    public addMember(field: Enum.Member): void {
        this.fields.push({
            name: field.name,
            wireValue: field.value,
            value: this.csharp.annotation({
                reference: this.System.Runtime.Serialization.EnumMember,
                argument: this.csharp.codeblock((writer) => {
                    writer.write("Value = ");
                    writer.writeNode(this.csharp.string_({ string: field.value }));
                })
            })
        });
    }

    /**
     * Enables generation of a companion JsonConverter class that uses dictionary lookups
     * instead of reflection.
     */
    public enableSerializerGeneration(): ClassReference {
        this.generateSerializer = true;
        this.serializerClassReference = this.csharp.classReference({
            name: `${this.name}Serializer`,
            namespace: this.namespace
        });
        return this.serializerClassReference;
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

        if (this.generateSerializer) {
            this.writeSerializerClass(writer);
        }
    }

    private writeSerializerClass(writer: Writer): void {
        writer.newLine();
        writer.writeLine(
            `internal class ${this.name}Serializer : global::System.Text.Json.Serialization.JsonConverter<${this.name}>`
        );
        writer.pushScope();

        // Write string-to-enum dictionary
        writer.writeLine(
            `private static readonly global::System.Collections.Generic.Dictionary<string, ${this.name}> _stringToEnum = new()`
        );
        writer.pushScope();
        for (const field of this.fields) {
            writer.writeLine(`{ ${JSON.stringify(field.wireValue)}, ${this.name}.${field.name} },`);
        }
        writer.popScope(false);
        writer.writeLine(";");
        writer.newLine();

        // Write enum-to-string dictionary
        writer.writeLine(
            `private static readonly global::System.Collections.Generic.Dictionary<${this.name}, string> _enumToString = new()`
        );
        writer.pushScope();
        for (const field of this.fields) {
            writer.writeLine(`{ ${this.name}.${field.name}, ${JSON.stringify(field.wireValue)} },`);
        }
        writer.popScope(false);
        writer.writeLine(";");
        writer.newLine();

        // Write Read method
        writer.writeLine(
            `public override ${this.name} Read(ref global::System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, global::System.Text.Json.JsonSerializerOptions options)`
        );
        writer.pushScope();
        writer.writeLine(
            `var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");`
        );
        writer.writeLine(`return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;`);
        writer.popScope();
        writer.newLine();

        // Write Write method
        writer.writeLine(
            `public override void Write(global::System.Text.Json.Utf8JsonWriter writer, ${this.name} value, global::System.Text.Json.JsonSerializerOptions options)`
        );
        writer.pushScope();
        writer.writeLine(
            `writer.WriteStringValue(_enumToString.TryGetValue(value, out var stringValue) ? stringValue : null);`
        );
        writer.popScope();
        writer.newLine();

        // Write ReadAsPropertyName method
        writer.writeLine(
            `public override ${this.name} ReadAsPropertyName(ref global::System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, global::System.Text.Json.JsonSerializerOptions options)`
        );
        writer.pushScope();
        writer.writeLine(
            `var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON property name could not be read as a string.");`
        );
        writer.writeLine(`return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;`);
        writer.popScope();
        writer.newLine();

        // Write WriteAsPropertyName method
        writer.writeLine(
            `public override void WriteAsPropertyName(global::System.Text.Json.Utf8JsonWriter writer, ${this.name} value, global::System.Text.Json.JsonSerializerOptions options)`
        );
        writer.pushScope();
        writer.writeLine(
            `writer.WritePropertyName(_enumToString.TryGetValue(value, out var stringValue) ? stringValue : value.ToString());`
        );
        writer.popScope();

        writer.popScope();
    }
}
