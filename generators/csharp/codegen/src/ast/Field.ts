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
        /* The access level of the method */
        access: Access;
        /* Whether the the field is a constant value */
        const_?: boolean;
        /* Whether the the field should use the new keyword */
        new_?: boolean;
        /* Whether the field has a getter method */
        get?: boolean;
        /* Whether the field has an init method. Cannot be used with a set method. */
        init?: boolean;
        /* Whether the field has an set method. Cannot be used with an init method. */
        set?: boolean;
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
        /* If true, the default initializer (if any) is not included. */
        skipDefaultInitializer?: boolean;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly access: Access;
    private type: Type;
    private const_: boolean;
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
    private skipDefaultInitializer: boolean;

    constructor({
        name,
        type,
        access,
        const_,
        new_,
        get,
        init,
        set,
        annotations,
        initializer,
        summary,
        jsonPropertyName,
        static_,
        useRequired,
        skipDefaultInitializer
    }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.const_ = const_ ?? false;
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
        this.skipDefaultInitializer = skipDefaultInitializer ?? false;

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
            writer.writeDocXml().writeNodeWithEscaping("summary", this.summary);
        }

        if (this.annotations.length > 0) {
            for (const annotation of this.annotations) {
                writer.write("[");
                annotation.write(writer);
                writer.writeLine("]");
            }
        }

        writer.write(`${this.access} `);
        if (this.const_) {
            writer.write("const ");
        }
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

        const useExpressionBodiedPropertySyntax = this.get && !this.init && !this.set && this.initializer != null;
        if ((this.get || this.init || this.set) && !useExpressionBodiedPropertySyntax) {
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
            if (useExpressionBodiedPropertySyntax) {
                writer.write(" => ");
            } else {
                writer.write(" = ");
            }
            this.initializer.write(writer);
            writer.writeLine(";");
        } else if (!this.skipDefaultInitializer && !isOptional && isCollection) {
            this.type.writeEmptyCollectionInitializer(writer);
        } else if (!this.get && !this.init) {
            writer.writeLine(";");
        }
    }
}
