import { fail } from "assert";
import { type Generation } from "../../context/generation-info";
import { type Origin } from "../../context/model-navigator";
import { is } from "../../utils/type-guards";
import { type ClassInstantiation } from "../code/ClassInstantiation";
import { MemberNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Access } from "../language/Access";
import { Annotation } from "../language/Annotation";
import { CodeBlock } from "../language/CodeBlock";
import { XmlDocBlock } from "../language/XmlDocBlock";
import { ClassReference } from "./ClassReference";
import { type Type } from "./Type";

export declare namespace Field {
    export type Accessors = {
        get?: (writer: Writer) => void;
        set?: (writer: Writer) => void;
        init?: (writer: Writer) => void;
    };

    interface Args extends MemberNode.Args {
        /* The name of the field */
        name?: string;
        /* The type of the field */
        type: Type | ClassReference;
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
        annotations?: (Annotation | ClassReference)[];
        /* The initializer for the field */
        initializer?: CodeBlock | ClassInstantiation;
        /* The summary tag (used for describing the field) */
        summary?: string;
        /* The doc block (used for describing the field) */
        doc?: XmlDocBlock.Like;
        /* JSON value for this particular field */
        jsonPropertyName?: string;
        /* If true, we will consider setting the field to required based on its type. If false, we will not. */
        useRequired?: boolean;
        /* If true, the default initializer (if any) is not included. */
        skipDefaultInitializer?: boolean;
        /* If specified, use the interface name in front of the field name */
        interfaceReference?: ClassReference;
        /* If true, the field is overridden */
        override?: boolean;

        /* If specified, use the accessor methods for the field implementation */
        accessors?: Accessors;
    }
}

export interface FieldArgsWithOrigin extends Field.Args {
    origin: Origin;
    // enclosingType: ClassReference|Interface|Class;
    name?: never;
}

export interface FieldArgsWithName extends Field.Args {
    name: string;
    origin?: never;
}

export class Field extends MemberNode {
    public readonly name: string;
    public readonly access: Access | undefined;
    public readonly type: Type;
    private readonly const_: boolean;
    private readonly static_: boolean;
    private readonly get: Access | boolean;
    private readonly init: Access | boolean;
    private readonly set: Access | boolean;
    private readonly new_: boolean;
    private readonly annotations: Annotation[];
    private readonly initializer?: CodeBlock | ClassInstantiation;
    private readonly doc: XmlDocBlock;
    private readonly jsonPropertyName?: string;
    private readonly readonly?: boolean;
    private readonly useRequired: boolean;
    private readonly skipDefaultInitializer: boolean;
    private readonly interfaceReference?: ClassReference;
    private readonly accessors?: {
        get?: (writer: Writer) => void;
        set?: (writer: Writer) => void;
        init?: (writer: Writer) => void;
    };
    private readonly override?: boolean;
    constructor(
        {
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
            doc,
            jsonPropertyName,
            readonly,
            static_,
            useRequired,
            skipDefaultInitializer,
            interfaceReference,
            accessors,
            override,
            origin,
            enclosingType
        }: Field.Args,
        generation: Generation
    ) {
        super({ enclosingType }, origin, generation);

        if (!enclosingType) {
            throw new Error("Enclosing type is required");
        }

        name = name || (origin ? this.model.getPropertyNameFor(origin) : fail("Field name or origin is required"));

        // verify that the field name is available or get a new name
        this.name = (enclosingType instanceof ClassReference ? enclosingType : enclosingType.reference).registerField(
            name,
            origin,
            this
        );

        this.type = type;
        this.const_ = const_ ?? false;
        this.new_ = new_ ?? false;
        this.access = access;
        this.get = get ?? !!accessors?.get;
        this.set = set ?? !!accessors?.set;
        this.init = init ?? !!accessors?.init;
        this.annotations = (annotations ?? []).map((annotation) =>
            annotation instanceof ClassReference ? this.csharp.annotation({ reference: annotation }) : annotation
        );
        this.initializer = initializer;
        this.doc = this.csharp.xmlDocBlockOf(doc ?? { summary });
        this.jsonPropertyName = jsonPropertyName;
        this.readonly = readonly;
        this.static_ = static_ ?? false;
        this.useRequired = useRequired ?? false;
        this.skipDefaultInitializer = skipDefaultInitializer ?? false;
        this.interfaceReference = interfaceReference;
        this.accessors = accessors;
        this.override = override ?? false;
        if (this.jsonPropertyName != null) {
            this.annotations = [
                this.csharp.annotation({
                    reference: this.System.Text.Json.Serialization.JsonPropertyName,
                    argument: `"${this.jsonPropertyName}"`
                }),
                ...this.annotations
            ];
        }
    }

    public get needsIntialization(): boolean {
        return !this.type.isOptional && this.initializer == null;
    }

    public get isConst(): boolean {
        return this.const_;
    }

    public get isField(): boolean {
        if (this.const_) {
            return false;
        }
        return !(this.get || this.init || this.set);
    }

    public get isProperty(): boolean {
        if (this.const_) {
            return false;
        }
        return !!(this.get || this.init || this.set);
    }

    public get isStatic(): boolean {
        return this.static_;
    }

    public get isRequired(): boolean {
        return this.useRequired;
    }

    public get isOptional(): boolean {
        return this.type.isOptional;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.doc);

        for (const annotation of this.annotations) {
            annotation.write(writer);
        }
        writer.writeNewLineIfLastLineNot();

        if (this.override) {
            writer.write("override ");
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
        const isOptional = this.type.isOptional;
        const isCollection = this.type.asNonOptional().isCollection;
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

        // TODO: refactor useExpressionBodiedPropertySyntax to be an argument that defaults to false
        // expression body will run the code every time, which is not the intended/expected behavior of initializer
        const useExpressionBodiedPropertySyntax = this.get && !this.init && !this.set && this.initializer != null;
        if ((this.get || this.init || this.set) && !useExpressionBodiedPropertySyntax) {
            writer.write(" { ");
            if (this.get) {
                if (!this.hasSameAccess(this.get)) {
                    writer.write(`${this.get} `);
                }
                if (this.accessors?.get) {
                    writer.write("get");
                    writer.write(` => `);
                    this.accessors.get(writer);
                    writer.writeTextStatement("");
                } else {
                    writer.write("get; ");
                }
            }
            if (this.init) {
                // if init is accessible to the end user (public, or protected through inheritance),
                // we should not expose init to the user on .NET Framework
                const needsFallback =
                    (this.access === Access.Public || this.access === Access.Protected) &&
                    (this.init === true || this.init === Access.Public || this.init === Access.Protected);
                if (needsFallback) {
                    writer.writeLine();
                    writer.writeNoIndent("#if NET5_0_OR_GREATER\n");
                    if (!this.hasSameAccess(this.init)) {
                        writer.write(`${this.init} `);
                    }
                    writer.writeTextStatement("init");
                    writer.writeNoIndent("#else\n");
                    writer.writeTextStatement("set");
                    writer.writeNoIndent("#endif\n");
                } else {
                    if (!this.hasSameAccess(this.init)) {
                        writer.write(`${this.init} `);
                    }

                    if (this.accessors?.init) {
                        writer.write("init");
                        writer.write(` => `);
                        this.accessors.init(writer);
                        writer.writeTextStatement("");
                    } else {
                        writer.write("init; ");
                    }
                }
            }
            if (this.set) {
                if (!this.hasSameAccess(this.set)) {
                    writer.write(`${this.set} `);
                }

                if (this.accessors?.set) {
                    writer.write("set");
                    writer.write(` => `);
                    this.accessors.set(writer);
                    writer.writeTextStatement("");
                } else {
                    writer.write("set; ");
                }
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
            if (is.Type(this.type)) {
                this.type.writeEmptyCollectionInitializer(writer);
            }
        } else if (!this.get && !this.init) {
            writer.writeLine(";");
        }
    }

    private hasSameAccess(access: Access | boolean): boolean {
        return access === true || access === this.access;
    }
}
