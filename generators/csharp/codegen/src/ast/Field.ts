import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { DocXmlWriter } from "./core/DocXmlWriter";
import { Writer } from "./core/Writer";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* The access level of the method */
        access?: Access;
        /* Whether the the field is a constant value */
        const_?: boolean;
        /* Whether the the field should use the new keyword */
        new_?: boolean;
        /*
        The access modifier for the get, no get is generated if false.
        If true, get is added without an access modifier.
        Defaults to false. */
        get?: Access | boolean;
        /*
        The access modifier for the init, no init is generated if false.
        If true, init is added without an access modifier.
        Cannot be used with a set method.
        Defaults to false.
        */
        init?: Access | boolean;
        /*
        The access modifier for the set, no get is generated if false.
        If true, set is added without an access modifier.
        Cannot be used with an init method.
        Defaults to false.
        */
        set?: Access | boolean;
        /* Whether the field is static */
        static_?: boolean;
        /* Whether the field is readonly */
        readonly?: boolean;
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
        /* If specified, use the interface name in front of the field name */
        interfaceReference?: ClassReference;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly access: Access | undefined;
    public readonly type: Type;
    private const_: boolean;
    private new_: boolean;
    private get: Access | boolean;
    private init: Access | boolean;
    private set: Access | boolean;
    private annotations: Annotation[];
    private initializer?: CodeBlock;
    private summary?: string;
    private jsonPropertyName?: string;
    private readonly?: boolean;
    private static_?: boolean;
    private useRequired: boolean;
    private skipDefaultInitializer: boolean;
    private interfaceReference?: ClassReference;

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
        readonly,
        static_,
        useRequired,
        skipDefaultInitializer,
        interfaceReference
    }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.const_ = const_ ?? false;
        this.new_ = new_ ?? false;
        this.access = access;
        this.get = get ?? false;
        this.set = set ?? false;
        this.init = init ?? false;
        this.annotations = annotations ?? [];
        this.initializer = initializer;
        this.summary = summary;
        this.jsonPropertyName = jsonPropertyName;
        this.readonly = readonly;
        this.static_ = static_;
        this.useRequired = useRequired ?? false;
        this.skipDefaultInitializer = skipDefaultInitializer ?? false;
        this.interfaceReference = interfaceReference;

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
            const docXmlWriter = new DocXmlWriter(writer);
            docXmlWriter.writeNodeWithEscaping("summary", this.summary);
        }

        if (this.annotations.length > 0) {
            for (const annotation of this.annotations) {
                writer.write("[");
                annotation.write(writer);
                writer.writeLine("]");
            }
        }

        if (this.access) {
            writer.write(`${this.access} `);
        }
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
        if (this.readonly) {
            writer.write("readonly ");
        }
        writer.writeNode(this.type);
        writer.write(" ");
        if (this.interfaceReference) {
            writer.write(`${this.interfaceReference.name}.`);
        }
        writer.write(this.name);

        const useExpressionBodiedPropertySyntax = this.get && !this.init && !this.set && this.initializer != null;
        if ((this.get || this.init || this.set) && !useExpressionBodiedPropertySyntax) {
            writer.write(" { ");
            if (this.get) {
                if (!this.hasSameAccess(this.get)) {
                    writer.write(`${this.get} `);
                }
                writer.write("get; ");
            }
            if (this.init) {
                if (!this.hasSameAccess(this.init)) {
                    writer.write(`${this.init} `);
                }
                writer.write("init; ");
            }
            if (this.set) {
                if (!this.hasSameAccess(this.set)) {
                    writer.write(`${this.set} `);
                }
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

    private hasSameAccess(access: Access | boolean): boolean {
        return access === true || access === this.access;
    }
}
