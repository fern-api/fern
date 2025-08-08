import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { ClassInstantiation } from "./ClassInstantiation";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Field } from "./Field";
import { Interface } from "./Interface";
import { Method, MethodType } from "./Method";
import { MethodInvocation } from "./MethodInvocation";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { XmlDocBlock } from "./XmlDocBlock";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export class Class extends AstNode {
    public static readonly ClassType = {
        Class: "class",
        Record: "record",
        Struct: "struct",
        RecordStruct: "record struct"
    } as const;
    public static readonly Access = Access;
    public readonly name: string;
    public readonly namespace: string;
    public readonly access: Access;
    public readonly static_: boolean;
    public readonly abstract_: boolean;
    public readonly sealed: boolean;
    public readonly readonly: boolean;
    public readonly partial: boolean;
    public readonly reference: ClassReference;
    public readonly parentClassReference: AstNode | undefined;
    public readonly interfaceReferences: ClassReference[];
    public readonly enclosingType: ClassReference | undefined;
    public readonly type: Class.ClassType;
    public readonly summary: string | undefined;
    private readonly doc: XmlDocBlock;
    public readonly annotations: Annotation[] = [];
    public readonly primaryConstructor: Class.PrimaryConstructor | undefined;

    private fields: Field[] = [];
    private constructors: Class.Constructor[] = [];
    private methods: Method[] = [];
    private operators: Class.Operator[] = [];
    private nestedClasses: Class[] = [];
    private nestedInterfaces: Interface[] = [];

    constructor({
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
        primaryConstructor
    }: Class.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.access = access;
        this.static_ = static_ ?? false;
        this.abstract_ = abstract_ ?? false;
        this.sealed = sealed ?? false;
        this.readonly = readonly ?? false;
        this.partial = partial ?? false;
        this.enclosingType = enclosingType;
        this.type = type ?? Class.ClassType.Class;
        this.summary = summary;
        this.doc = XmlDocBlock.of(doc ?? { summary });
        this.parentClassReference = parentClassReference;
        this.interfaceReferences = interfaceReferences ?? [];
        this.annotations = annotations ?? [];
        this.reference = new ClassReference({
            name: this.name,
            namespace: this.namespace,
            enclosingType: this.enclosingType
        });
        this.primaryConstructor = primaryConstructor;
    }

    public get isNestedClass(): boolean {
        return this.enclosingType != null;
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addFields(fields: Field[]): void {
        fields.forEach((field) => this.fields.push(field));
    }

    public addConstructors(constructors: Class.Constructor[]): void {
        constructors.forEach((constructor) => this.addConstructor(constructor));
    }

    public addConstructor(constructor: Class.Constructor): void {
        this.constructors.push(constructor);
    }

    public addMethod(method: Method): void {
        this.methods.push(method);
    }

    public addMethods(methods: Method[]): void {
        methods.forEach((method) => this.addMethod(method));
    }

    public addNestedClass(subClass: Class): void {
        if (!subClass.isNestedClass) {
            throw new Error(
                `Set the enclosingType of the class ${this.name} to add the nested class ${subClass.name}.`
            );
        }
        this.nestedClasses.push(subClass);
    }

    public addNestedClasses(subClasses: Class[]): void {
        subClasses.forEach((subClass) => this.addNestedClass(subClass));
    }

    public addNestedInterface(subInterface: Interface): void {
        this.nestedInterfaces.push(subInterface);
    }

    public addAnnotation(annotation: Annotation): void {
        this.annotations.push(annotation);
    }

    public addOperator(operator: Class.Operator): void {
        this.operators.push(operator);
    }

    public addOperators(operators: Class.Operator[]): void {
        operators.forEach((operator) => this.addOperator(operator));
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public write(writer: Writer): void {
        if (!this.isNestedClass) {
            writer.writeLine(`namespace ${this.namespace};`);
            writer.newLine();
        }

        writer.writeNode(this.doc);
        this.annotations.forEach((annotation) => {
            annotation.write(writer);
        });
        writer.writeNewLineIfLastLineNot();
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
        writer.writeLine("{");
        writer.indent();

        this.writeConsts(writer);
        this.writeFieldFields(writer);
        this.writeConstructors(writer);
        this.writeProperties(writer);
        this.writeMethods(writer);
        this.writeOperators(writer);
        this.writeNestedClasses(writer);
        this.writeNestedInterfaces(writer);

        writer.dedent();
        writer.writeLine("}");
    }

    private hasBody(): boolean {
        return (
            this.fields.length > 0 ||
            this.constructors.length > 0 ||
            this.nestedClasses.length > 0 ||
            this.nestedInterfaces.length > 0 ||
            this.methods.length > 0 ||
            this.operators.length > 0
        );
    }

    private writeConstructors(writer: Writer): void {
        this.constructors.forEach((constructor) => {
            writer.writeNode(XmlDocBlock.of(constructor.doc));
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
            writer.writeLine(" {");
            writer.indent();
            constructor.body?.write(writer);
            writer.dedent();
            writer.writeLine("}");
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
}

export namespace Class {
    export type ClassType = (typeof Class.ClassType)[keyof typeof Class.ClassType];
    export interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
        /* The access level of the C# class */
        access: Access;
        /* Defaults to false */
        static_?: boolean;
        /* Defaults to false */
        abstract_?: boolean;
        /* Defaults to false */
        sealed?: boolean;
        /* Defaults to false */
        partial?: boolean;
        /* Defaults to false */
        readonly?: boolean;
        /* Defaults to class */
        type?: Class.ClassType;
        /* Summary for the class */
        summary?: string;
        doc?: XmlDocBlock.Like;
        /* The class to inherit from if any */
        parentClassReference?: AstNode;
        /* Any interfaces the class extends */
        interfaceReferences?: ClassReference[];
        /* The type that this class is nested in */
        enclosingType?: ClassReference;
        /* Any annotations to add to the class */
        annotations?: Annotation[];
        /* Any annotations to add to the class */
        primaryConstructor?: PrimaryConstructor;
    }

    export interface Constructor {
        doc?: XmlDocBlock.Like;
        /* The body of the constructor */
        body?: CodeBlock;
        /* The parameters of the constructor */
        parameters: Parameter[];
        /* The access of the constructor */
        access: Access;
        /* The base constructor call, ex: public SomeClassName(string message) : base(message) { } */
        baseConstructorCall?: MethodInvocation;
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
