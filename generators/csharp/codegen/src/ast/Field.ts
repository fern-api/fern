import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Type } from "./Type";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* Whether the the field should use the new keyword */
        new_?: boolean;
        /* Whether the field has a getter method */
        get?: boolean;
        /* Whether the field has an init method. Cannot be used with a set method. */
        init?: boolean;
        /* Whether the field has an set method. Cannot be used with an init method. */
        set?: boolean;
        /* The access level of the method */
        access: Access;
        /* Whether the field is static */
        static_?: boolean;
        /* Field annotations */
        annotations?: Annotation[];
        /* The initializer for the field */
        initializer?: CodeBlock;
        /* The summary tag (used for describing the field) */
        summary?: string;
        /* JSON value for this particular field */
        jsonPropertyName?: string;
        /* If true, we will consider setting the field to required based on its type. If false, we will not. */
        useRequired?: boolean;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly access: Access;
    private type: Type;
    private new_: boolean;
    private get: boolean;
    private init: boolean;
    private set: boolean;
    private annotations: Annotation[];
    private initializer: CodeBlock | undefined;
    private summary: string | undefined;
    private jsonPropertyName: string | undefined;
    private static_: boolean | undefined;
    private useRequired: boolean;

    constructor({
        name,
        type,
        new_,
        get,
        init,
        set,
        access,
        annotations,
        initializer,
        summary,
        jsonPropertyName,
        static_,
        useRequired
    }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.new_ = new_ ?? false;
        this.get = get ?? false;
        this.init = init ?? false;
        this.set = set ?? false;
        this.access = access;
        this.annotations = annotations ?? [];
        this.initializer = initializer;
        this.summary = summary;
        this.jsonPropertyName = jsonPropertyName;
        this.static_ = static_;
        this.useRequired = useRequired ?? false;

        if (this.jsonPropertyName != null) {
            this.annotations = [
                new Annotation({
                    reference: new ClassReference({
                        name: "JsonPropertyName",
                        namespace: "System.Text.Json.Serialization"
                    }),
                    argument: `"${this.jsonPropertyName}"`
                }),
                ...this.annotations
            ];
        }
    }

    public write(writer: Writer): void {
        if (this.summary != null) {
            writer.writeLine("/// <summary>");
            this.summary.split("\n").forEach((line) => {
                writer.writeLine(`/// ${line}`);
            });
            writer.writeLine("/// </summary>");
        }

        if (this.annotations.length > 0) {
            for (const annotation of this.annotations) {
                writer.write("[");
                annotation.write(writer);
                writer.writeLine("]");
            }
        }

        writer.write(`${this.access} `);
        if (this.new_) {
            writer.write("new ");
        }
        const underlyingTypeIfOptional = this.type.underlyingTypeIfOptional();
        const isOptional = underlyingTypeIfOptional != null;
        const isCollection = (underlyingTypeIfOptional ?? this.type).isCollection();
        if (this.useRequired && !isOptional && !isCollection && this.initializer == null) {
            writer.write("required ");
        }
        if (this.static_) {
            writer.write("static ");
        }
        writer.writeNode(this.type);
        writer.write(` ${this.name}`);

        if (this.get || this.init) {
            writer.write(" { ");
            if (this.get) {
                writer.write("get; ");
            }
            if (this.init) {
                writer.write("init; ");
            }
            if (this.set) {
                writer.write("set; ");
            }
            writer.write("}");
        }

        if (this.initializer != null) {
            writer.write(" = ");
            this.initializer.write(writer);
            writer.writeLine(";");
        } else if (!isOptional && isCollection) {
            this.type.writeEmptyCollectionInitializer(writer);
        } else if (!this.get && !this.init) {
            writer.writeLine(";");
        }
    }
}
