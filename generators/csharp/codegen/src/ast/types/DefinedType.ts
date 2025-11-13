import { fail } from "assert";
import { type Generation } from "../../context/generation-info";
import { type Provenance } from "../../context/model-navigator";
import { is } from "../../utils/type-guards";
import { Literal } from "../code/Literal";
import { Node } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Access } from "../language/Access";
import { type ClassReference } from "./ClassReference";
import { Field, FieldArgsWithName, FieldArgsWithOrigin } from "./Field";
import { Method } from "./Method";
import { Optional, type Type } from "./Type";

export declare namespace DefinedType {
    interface Args extends Node.Args {
        /* The name of the C# class */
        name?: string;
        /* The namespace of the C# class*/
        namespace?: string;
        /* The type that this class is nested in */
        enclosingType?: ClassReference;

        /* The access level of the C# class */
        access: Access;
        /* Defaults to false */
        partial?: boolean;
        /* Any interfaces the interface implements */
        interfaceReferences?: ClassReference[];
    }
}

export abstract class DefinedType extends Node {
    public readonly access: Access;
    public readonly partial: boolean;
    public readonly reference: ClassReference;
    public readonly interfaceReferences: ClassReference[];

    protected fields: Field[] = [];
    protected methods: Method[] = [];

    constructor(
        { name, namespace, access, partial, interfaceReferences, enclosingType, origin }: DefinedType.Args,
        generation: Generation
    ) {
        super(origin, generation);

        // resolve the expected name for the type
        name =
            name || (origin ? this.model.getClassNameFor(origin) : fail("Class/Interface name or origin is required"));

        // build the class reference from the arguments.
        // if the name has to be adjusted it will be done when the class reference is created.
        this.reference = enclosingType
            ? this.csharp.classReference({
                  name: name,
                  enclosingType: enclosingType
              })
            : this.csharp.classReference({
                  name: name,
                  namespace: namespace || fail("Class/Interface: Namespace or enclosingType is required ")
              });

        this.access = access;
        this.partial = partial ?? false;
        this.interfaceReferences = interfaceReferences ?? [];
    }

    public abstract override write(writer: Writer): void;

    public get name() {
        return this.reference.name;
    }
    public get namespace() {
        return this.reference.namespace;
    }
    public get enclosingType() {
        return this.reference.enclosingType;
    }

    public get isNested(): boolean {
        return this.enclosingType != null;
    }

    public explicit(name: string): Provenance {
        return this.origin
            ? this.model.explicit(is.Provenance(this.origin) ? this.origin.node : this.origin, name)
            : fail(
                  `Cannot create explicit named member '${name}' on '${this.name}' because the class is not bound to an origin.`
              );
    }

    public getField(origin: Provenance): Field | undefined {
        return this.fields.find((each) => this.model.provenance(each.origin)?.jsonPath === origin.jsonPath);
    }

    public addField(args: FieldArgsWithOrigin): Field;
    public addField(args: FieldArgsWithName): Field;
    public addField(args: Field.Args): Field {
        args.enclosingType = this.reference;
        const field = new Field(args, this.generation);
        this.fields.push(field);
        return field;
    }

    public addMethod(args: Method.Args): Method {
        args.enclosingType = this.reference;
        const method = new Method(args, this.generation);
        this.methods.push(method);
        return method;
    }

    public get multipartMethodName(): string {
        return "AddJsonPart";
    }

    public get multipartMethodNameForCollection(): string {
        return "AddJsonParts";
    }

    public get isOptional(): boolean {
        return false;
    }

    public get isCollection(): boolean {
        return false;
    }

    public get isReferenceType(): boolean | undefined {
        return undefined;
    }

    public asOptional(): Type {
        return new Optional(this, this.generation);
    }

    public asNonOptional(): Type {
        return this;
    }

    /** returns true if this class reference is the IAsyncEnumerable class */
    public get isAsyncEnumerable() {
        return this.name === "IAsyncEnumerable" && this.namespace === "System.Collections.Generic";
    }

    public get defaultValue(): Literal {
        return this.csharp.Literal.null();
    }

    public get fullyQualifiedName(): string {
        return this.reference.fullyQualifiedName;
    }
}
