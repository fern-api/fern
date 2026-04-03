import { type Generation } from "../../context/generation-info.js";
import { Block } from "../code/Block.js";
import { type ClassInstantiation } from "../code/ClassInstantiation.js";
import { MethodInvocation } from "../code/MethodInvocation.js";
import { AstNode } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";
import { Access } from "../language/Access.js";
import { Annotation } from "../language/Annotation.js";
import { CodeBlock } from "../language/CodeBlock.js";
import { Parameter } from "../language/Parameter.js";
import { XmlDocBlock } from "../language/XmlDocBlock.js";
import { ClassReference } from "./ClassReference.js";
import { DefinedType } from "./DefinedType.js";
import { Field } from "./Field.js";
import { Interface } from "./Interface.js";
import { Type } from "./IType.js";
import { MethodType } from "./Method.js";

export class Class extends DefinedType {
    public static readonly ClassType = {
        Class: "class",
        Record: "record",
        Struct: "struct",
        RecordStruct: "record struct"
    } as const;
    public static readonly Access = Access;

    public readonly static_: boolean;
    public readonly abstract_: boolean;
    public readonly sealed: boolean;
    public readonly readonly: boolean;
    public readonly parentClassReference: AstNode | undefined;
    public readonly type: Class.ClassType;
    public readonly summary: string | undefined;
    private readonly doc: XmlDocBlock;
    public readonly annotations: Annotation[] = [];
    public readonly primaryConstructor: Class.PrimaryConstructor | undefined;
    public readonly namespaceReferences: string[] = [];
    public readonly skipNamespaceDeclaration: boolean;

    private constructors: Class.Constructor[] = [];
    private operators: Class.Operator[] = [];
    private nestedClasses: Class[] = [];
    private nestedInterfaces: Interface[] = [];
    private rawBodyBlocks: CodeBlock[] = [];

    constructor(
        {
            name,
            namespace,
            access,
            static_,
            abstract_,
            sealed,
            partial,
            readonly,
            parentClassReference,
            interfaceReferences,
            enclosingType,
            type,
            summary,
            doc,
            annotations,
            primaryConstructor,
            skipNamespaceDeclaration,
            origin
        }: Class.Args,
        generation: Generation
    ) {
        super({ name, namespace, access, partial, interfaceReferences, enclosingType, origin }, generation);

        this.skipNamespaceDeclaration = skipNamespaceDeclaration ?? false;
        this.static_ = static_ ?? false;
        this.abstract_ = abstract_ ?? false;
        this.sealed = sealed ?? false;
        this.readonly = readonly ?? false;
        this.type = type ?? Class.ClassType.Class;
        this.summary = summary;
        this.doc = this.csharp.xmlDocBlockOf(doc ?? { summary });
        this.parentClassReference = parentClassReference;
        this.annotations = (annotations ?? []).map((annotation) =>
            annotation instanceof ClassReference ? this.csharp.annotation({ reference: annotation }) : annotation
        );
        this.primaryConstructor = primaryConstructor;
    }

    public addConstructor(constructor: Class.Constructor.Args): Class.Constructor {
        const ctor = new Class.Constructor(constructor, this.generation);
        this.constructors.push(ctor);
        return ctor;
    }

    public addNestedClass(subClassArgs: Class.Args): Class;
    public addNestedClass(subClass: Class): Class;
    public addNestedClass(subClass: Class | Class.Args): Class {
        if (!(subClass instanceof Class)) {
            // Set the enclosing type context
            subClass.enclosingType = this.reference;
            subClass = new Class(subClass, this.generation);
        }
        if (!subClass.isNested) {
            throw new Error(
                `Set the enclosingType of the class ${this.name} to add the nested class ${subClass.name}.`
            );
        }
        this.nestedClasses.push(subClass);
        return subClass;
    }

    public addNestedClasses(subClasses: Class[] | Class.Args[]): void {
        subClasses.forEach((subClass) => {
            if (subClass instanceof Class) {
                this.addNestedClass(subClass);
            } else {
                this.addNestedClass(subClass);
            }
        });
    }

    public addAnnotation(annotationArgs: Annotation.Args): Annotation;
    public addAnnotation(annotation: Annotation): Annotation;
    public addAnnotation(annotation: Annotation | Annotation.Args): Annotation {
        if (!(annotation instanceof Annotation)) {
            annotation = new Annotation(annotation, this.generation);
        }
        this.annotations.push(annotation);
        return annotation;
    }

    public addOperator(operator: Class.Operator): void {
        this.operators.push(operator);
    }

    public addOperators(operators: Class.Operator[]): void {
        operators.forEach((operator) => this.addOperator(operator));
    }

    /**
     * Adds a raw content block to the class body.
     * This is written after operators and before nested classes.
     * Useful for injecting pre-formatted code (e.g., nested literal struct members).
     */
    public addRawBodyContent(content: CodeBlock): void {
        this.rawBodyBlocks.push(content);
    }

    public write(writer: Writer): void {
        // tell the writer of any namespaces that this class references
        this.namespaceReferences.forEach((namespace) => {
            writer.addNamespace(namespace);
        });

        if (!this.isNested && !this.skipNamespaceDeclaration) {
            writer.writeLine(`namespace ${this.namespace};`);
            writer.newLine();
        }

        writer.writeNode(this.doc);
        this.annotations.forEach((annotation) => {
            annotation.write(writer);
        });
        if (!this.skipNamespaceDeclaration) {
            writer.writeNewLineIfLastLineNot();
        }
        writer.write(`${this.access}`);
        if (this.static_) {
            writer.write(" static");
        }
        if (this.abstract_) {
            writer.write(" abstract");
        }
        if (this.sealed) {
            writer.write(" sealed");
        }
        if (this.readonly) {
            writer.write(" readonly");
        }
        if (this.partial) {
            writer.write(" partial");
        }
        writer.write(` ${this.type}`);
        writer.write(` ${this.name}`);
        if (this.primaryConstructor != null && this.primaryConstructor.parameters.length > 0) {
            const primaryConstructor = this.primaryConstructor;
            writer.write("(");
            primaryConstructor.parameters.forEach((parameter, index) => {
                if (index > 0) {
                    writer.write(",");
                }
                parameter.write(writer);
            });
            writer.write(")");
        }
        if (this.parentClassReference != null || this.interfaceReferences.length > 0) {
            writer.write(" : ");
            if (this.parentClassReference != null) {
                this.parentClassReference.write(writer);
                if (this.interfaceReferences.length > 0) {
                    writer.write(", ");
                }
            }
            if (this.primaryConstructor != null && this.primaryConstructor.superClassArguments.length > 0) {
                const primaryConstructor = this.primaryConstructor;
                writer.write("(");
                this.primaryConstructor.superClassArguments.forEach((argument, index) => {
                    argument.write(writer);
                    if (index < primaryConstructor.superClassArguments.length - 1) {
                        writer.write(", ");
                    }
                });
                writer.write(")");
            }
            this.interfaceReferences.forEach((interfaceReference, index) => {
                interfaceReference.write(writer);
                // Don't write a comma after the last interface
                if (index < this.interfaceReferences.length - 1) {
                    writer.write(", ");
                }
            });
        }
        if (!this.hasBody()) {
            writer.write(";");
            return;
        }

        writer.writeNewLineIfLastLineNot();
        writer.pushScope();

        this.writeConsts(writer);
        this.writeFieldFields(writer);
        this.writeConstructors(writer);
        this.writeProperties(writer);
        this.writeMethods(writer);
        this.writeOperators(writer);
        this.writeRawBodyBlocks(writer);
        this.writeNestedClasses(writer);
        this.writeNestedInterfaces(writer);

        writer.popScope();
    }

    private hasBody(): boolean {
        return (
            this.fields.length > 0 ||
            this.constructors.length > 0 ||
            this.nestedClasses.length > 0 ||
            this.nestedInterfaces.length > 0 ||
            this.methods.length > 0 ||
            this.operators.length > 0 ||
            this.rawBodyBlocks.length > 0
        );
    }

    private writeConstructors(writer: Writer): void {
        this.constructors.forEach((constructor) => {
            writer.writeNode(this.csharp.xmlDocBlockOf(constructor.doc));
            constructor.annotations.forEach((annotation) => {
                annotation.write(writer);
                writer.writeNewLineIfLastLineNot();
            });
            writer.write(`${constructor.access} ${this.name} (`);
            constructor.parameters.forEach((parameter, index) => {
                parameter.write(writer);
                if (index < constructor.parameters.length - 1) {
                    writer.write(", ");
                }
            });
            writer.write(")");
            if (constructor.baseConstructorCall != null) {
                writer.write(" : ");
                constructor.baseConstructorCall.write(writer);
            }
            writer.pushScope();
            constructor.body.write(writer);
            writer.popScope();
            writer.newLine();
        });
    }

    private writeFields({ writer, fields }: { writer: Writer; fields: Field[] }): void {
        fields.forEach((field, index) => {
            field.write(writer);
            writer.writeNewLineIfLastLineNot();

            if (index < this.fields.length - 1) {
                writer.newLine();
            }
        });
    }

    private writeConsts(writer: Writer): void {
        this.writeFields({
            writer,
            fields: this.getFields().sort(sortByAccess).sort(sortByStatic).filter(this.fieldConstFilter())
        });
    }

    private writeFieldFields(writer: Writer): void {
        this.writeFields({
            writer,
            fields: this.getFields().sort(sortByAccess).sort(sortByStatic).filter(this.fieldFieldFilter())
        });
    }

    private writeProperties(writer: Writer): void {
        this.writeFields({
            writer,
            fields: this.getFields().sort(sortByAccess).sort(sortByStatic).filter(this.fieldPropertyFilter())
        });
    }

    private writeMethods(writer: Writer): void {
        this.methods
            .sort(sortByAccess)
            .sort(sortMethodName)
            .sort(sortMethodType)
            .forEach((method) => {
                method.write(writer);
                writer.writeNewLineIfLastLineNot();
                writer.newLine();
            });
    }

    private writeOperators(writer: Writer): void {
        this.operators.forEach((operator) => {
            this.writeOperator({ writer, operator });
            writer.newLine();
        });
    }

    private writeRawBodyBlocks(writer: Writer): void {
        this.rawBodyBlocks.forEach((block) => {
            block.write(writer);
            writer.writeNewLineIfLastLineNot();
        });
    }

    private writeNestedClasses(writer: Writer): void {
        this.nestedClasses.sort(sortByAccess).forEach((nestedClass, index) => {
            nestedClass.write(writer);
            writer.writeNewLineIfLastLineNot();

            if (index < this.fields.length - 1) {
                writer.newLine();
            }
        });
    }

    private writeNestedInterfaces(writer: Writer): void {
        this.nestedInterfaces.sort(sortByAccess).forEach((nestedInterface, index) => {
            nestedInterface.write(writer);
            writer.writeNewLineIfLastLineNot();

            if (index < this.fields.length - 1) {
                writer.newLine();
            }
        });
    }

    private fieldConstFilter(): (field: Field) => boolean {
        return (field) => field.isConst;
    }

    private fieldFieldFilter(): (field: Field) => boolean {
        return (field) => field.isField;
    }

    private fieldPropertyFilter(): (field: Field) => boolean {
        return (field) => field.isProperty;
    }

    public getFields(): Field[] {
        return this.fields;
    }

    public override get isReferenceType(): boolean {
        return this.type === Class.ClassType.Class || this.type === Class.ClassType.Record;
    }

    private writeOperator({ writer, operator }: { writer: Writer; operator: Class.Operator }): void {
        writer.write("public static ");
        if (operator.type === Class.CastOperator.Type.Explicit || operator.type === Class.CastOperator.Type.Implicit) {
            writer.write(`${operator.type} `);
            writer.write("operator ");
            const to = operator.to ?? this.reference;
            writer.writeNode(to);
            writer.write("(");
            operator.parameter.write(writer);
        } else {
            const normalOperator = operator as Class.NormalOperator;
            normalOperator.return.write(writer);
            writer.write(" operator ");
            writer.write(`${operator.type}(`);
            normalOperator.parameters.forEach((parameter, idx) => {
                parameter.write(writer);
                if (idx < normalOperator.parameters.length - 1) {
                    writer.write(", ");
                }
            });
        }
        if (operator.useExpressionBody) {
            writer.write(") => ");
            writer.writeNodeStatement(operator.body);
        } else {
            writer.write(") {");
            writer.writeNode(operator.body);
            writer.writeLine("}");
        }
    }

    public addNamespaceReference(namespace: string) {
        this.namespaceReferences.push(namespace);
    }
}

export namespace Class {
    export type ClassType = (typeof Class.ClassType)[keyof typeof Class.ClassType];
    export interface Args extends DefinedType.Args {
        /* Defaults to false */
        static_?: boolean;
        /* Defaults to false */
        abstract_?: boolean;
        /* Defaults to false */
        sealed?: boolean;
        /* Defaults to false */
        readonly?: boolean;
        /* Defaults to class */
        type?: Class.ClassType;
        /* Summary for the class */
        summary?: string;
        doc?: XmlDocBlock.Like;
        /* The class to inherit from if any */
        parentClassReference?: AstNode;
        /* Any annotations to add to the class */
        annotations?: (Annotation | ClassReference)[];
        /* Any annotations to add to the class */
        primaryConstructor?: PrimaryConstructor;
        /* If true, omit the `namespace X;` declaration from the output. Defaults to false. */
        skipNamespaceDeclaration?: boolean;
    }

    export namespace Constructor {
        export interface Args {
            /* The XML doc block for the constructor */
            doc?: XmlDocBlock.Like;
            /* The body of the constructor */
            body?: CodeBlock;
            /* The parameters of the constructor */
            parameters?: Parameter[];
            /* The access of the constructor */
            access?: Access;
            /* The base constructor call, ex: public SomeClassName(string message) : base(message) { } */
            baseConstructorCall?: MethodInvocation;
            /* Any annotations to add to the constructor */
            annotations?: Annotation[];
        }
    }
    export class Constructor {
        /** The XML doc block for the constructor */
        doc?: XmlDocBlock.Like;
        /* The body of the constructor */
        body: Block;
        /* The parameters of the constructor */
        parameters: Parameter[];
        /* The access of the constructor */
        access: Access;
        /* The base constructor call, ex: public SomeClassName(string message) : base(message) { } */
        baseConstructorCall?: MethodInvocation;
        /* Any annotations on the constructor */
        annotations: Annotation[];

        constructor(
            { doc, body, parameters, access, baseConstructorCall, annotations }: Constructor.Args,
            private readonly generation: Generation
        ) {
            this.parameters = parameters ?? [];
            this.access = access ?? Access.Public;
            this.doc = doc;
            this.annotations = annotations ?? [];
            this.body = new Block({}, this.generation);
            if (body != null) {
                this.body.append(body as CodeBlock);
            }

            this.baseConstructorCall = baseConstructorCall;
        }

        addParameter(args: Parameter.Args) {
            const parameter = new Parameter(args, this.generation);
            this.parameters.push(parameter);
            return parameter;
        }
    }

    export interface PrimaryConstructor {
        /* The parameters of the constructor */
        parameters: Parameter[];
        /* If this class extends another class, these will be the arguments passed to that parent class's constructor */
        superClassArguments: (CodeBlock | ClassInstantiation)[];
    }

    export interface CastOperator {
        parameter: Parameter;
        type: CastOperator.Type;
        to?: Type;
        body: CodeBlock;
        useExpressionBody?: boolean;
    }
    export namespace CastOperator {
        export const Type = {
            Implicit: "implicit",
            Explicit: "explicit"
        } as const;
        export type Type = (typeof CastOperator.Type)[keyof typeof CastOperator.Type];
    }
    export interface NormalOperator {
        type: "==" | "!=";
        parameters: Parameter[];
        return: Type;
        body: CodeBlock;
        useExpressionBody?: boolean;
    }
    export type Operator = CastOperator | NormalOperator;
}

function accessSorter(access: Access | undefined): number {
    switch (access) {
        case undefined:
            return 0;
        case Access.Private:
            return 1;
        case Access.Protected:
            return 2;
        case Access.Internal:
            return 3;
        case Access.Public:
            return 4;
    }
}

function sortByAccess(a: { access: Access | undefined }, b: { access: Access | undefined }): number {
    return accessSorter(a.access) - accessSorter(b.access);
}

function sortByStatic(a: { isStatic: boolean }, b: { isStatic: boolean }): number {
    return a.isStatic === b.isStatic ? 0 : a.isStatic ? -1 : 1;
}

function sortMethodType(a: { type: MethodType }, b: { type: MethodType }): number {
    if (a.type === MethodType.STATIC && b.type !== MethodType.STATIC) {
        return -1;
    }
    if (a.type !== MethodType.STATIC && b.type === MethodType.STATIC) {
        return 1;
    }
    return 0;
}

function sortMethodName(a: { name: string }, b: { name: string }): number {
    // put FromProto and ToProto 3rd from last
    if (a.name === "FromProto" || a.name === "ToProto") {
        return b.name === "Equals" || b.name === "ToString" ? -1 : 1;
    }
    if (b.name === "FromProto" || b.name === "ToProto") {
        return a.name === "Equals" || a.name === "ToString" ? 1 : -1;
    }
    // put ToString last
    if (a.name === "ToString") {
        return 1;
    }
    if (b.name === "ToString") {
        return -1;
    }
    // put Equals second to last
    if (a.name === "Equals") {
        return b.name === "ToString" ? -1 : 1;
    }
    if (b.name === "Equals") {
        return a.name === "ToString" ? 1 : -1;
    }
    return 0;
}
