import { Access } from "./Access";
import { Annotation } from "./Annotation";
import { ClassInstantiation } from "./ClassInstantiation";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { Field } from "./Field";
import { Interface } from "./Interface";
import { Method } from "./Method";
import { MethodInvocation } from "./MethodInvocation";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { DocXmlWriter } from "./core/DocXmlWriter";
import { Writer } from "./core/Writer";

export declare namespace Class {
    type ClassType = (typeof Class.ClassType)[keyof typeof Class.ClassType];
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
        /* The access level of the C# class */
        access: Access;
        /* Defaults to false */
        static_?: boolean;
        /* Defaults to false */
        abstract?: boolean;
        /* Defaults to false */
        sealed?: boolean;
        /* Defaults to false */
        partial?: boolean;
        /* Defaults to false */
        readonly?: boolean;
        /* Defaults to class */
        type?: Class.ClassType;
        /* Summary for the method */
        summary?: string;
        /* The class to inherit from if any */
        parentClassReference?: AstNode;
        /* Any interfaces the class extends */
        interfaceReferences?: ClassReference[];
        /* Defaults to false */
        isNestedClass?: boolean;
        /* Any annotations to add to the class */
        annotations?: Annotation[];
        /* Any annotations to add to the class */
        primaryConstructor?: PrimaryConstructor;
    }

    interface Constructor {
        /* The body of the constructor */
        body?: CodeBlock;
        /* The parameters of the constructor */
        parameters: Parameter[];
        /* The access of the constructor */
        access: Access;
        /* The base constructor call, ex: public SomeClassName(string message) : base(message) { } */
        baseConstructorCall?: MethodInvocation;
    }

    interface PrimaryConstructor {
        /* The parameters of the constructor */
        parameters: Parameter[];
        /* If this class extends another class, these will be the arguments passed to that parent class's constructor */
        superClassArguments: (CodeBlock | ClassInstantiation)[];
    }

    interface CastOperator {
        parameter: Parameter;
        type: "implicit" | "explicit";
        body: CodeBlock;
        useExpressionBody?: boolean;
    }
    interface NormalOperator {
        type: "==" | "!=";
        parameters: Parameter[];
        return: Type;
        body: CodeBlock;
        useExpressionBody?: boolean;
    }
    type Operator = CastOperator | NormalOperator;
}

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
    public readonly abstract: boolean;
    public readonly sealed: boolean;
    public readonly readonly: boolean;
    public readonly partial: boolean;
    public readonly reference: ClassReference;
    public readonly parentClassReference: AstNode | undefined;
    public readonly interfaceReferences: ClassReference[];
    public readonly isNestedClass: boolean;
    public readonly type: Class.ClassType;
    public readonly summary: string | undefined;
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
        abstract,
        sealed,
        partial,
        readonly,
        parentClassReference,
        interfaceReferences,
        isNestedClass,
        type,
        summary,
        annotations,
        primaryConstructor
    }: Class.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.access = access;
        this.static_ = static_ ?? false;
        this.abstract = abstract ?? false;
        this.sealed = sealed ?? false;
        this.readonly = readonly ?? false;
        this.partial = partial ?? false;
        this.isNestedClass = isNestedClass ?? false;
        this.type = type ?? Class.ClassType.Class;
        this.summary = summary;

        this.parentClassReference = parentClassReference;
        this.interfaceReferences = interfaceReferences ?? [];
        this.annotations = annotations ?? [];
        this.reference = new ClassReference({
            name: this.name,
            namespace: this.namespace
        });
        this.primaryConstructor = primaryConstructor;
    }

    public addField(field: Field): void {
        this.fields.push(field);
    }

    public addFields(fields: Field[]): void {
        fields.forEach((field) => this.fields.push(field));
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
        this.nestedClasses.push(subClass);
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

    public getNamespace(): string {
        return this.namespace;
    }

    public write(writer: Writer): void {
        if (!this.isNestedClass) {
            writer.writeLine(`namespace ${this.namespace};`);
            writer.newLine();
        }

        if (this.summary != null) {
            const docXmlWriter = new DocXmlWriter(writer);
            docXmlWriter.writeNodeWithEscaping("summary", this.summary);
        }
        if (this.annotations.length > 0) {
            writer.write("[");
            this.annotations.forEach((annotation) => {
                annotation.write(writer);
            });
            writer.write("]");
            writer.writeNewLineIfLastLineNot();
        }
        writer.write(`${this.access}`);
        if (this.static_) {
            writer.write(" static");
        }
        if (this.abstract) {
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
        writer.writeNewLineIfLastLineNot();
        writer.writeLine("{");

        writer.indent();
        this.writeFields({ writer, fields: this.getFieldsByAccess(Access.Protected) });
        writer.dedent();

        writer.indent();
        this.writeFields({ writer, fields: this.getFieldsByAccess(Access.Private) });
        writer.dedent();

        writer.indent();
        this.writeConstructors({ writer, constructors: this.constructors });
        writer.dedent();

        writer.indent();
        this.writeFields({ writer, fields: this.getFieldsByAccess(Access.Public) });
        writer.dedent();

        writer.indent();
        this.writeFields({ writer, fields: this.getFieldsByAccess(Access.Internal) });
        writer.dedent();

        writer.indent();
        this.writeFields({ writer, fields: this.getFieldsByAccess(undefined) });
        writer.dedent();

        writer.indent();
        this.nestedClasses.forEach((nestedClass, index) => {
            nestedClass.write(writer);
            writer.writeNewLineIfLastLineNot();

            if (index < this.fields.length - 1) {
                writer.newLine();
            }
        });
        writer.dedent();

        writer.indent();
        this.nestedInterfaces.forEach((nestedInterface, index) => {
            nestedInterface.write(writer);
            writer.writeNewLineIfLastLineNot();

            if (index < this.fields.length - 1) {
                writer.newLine();
            }
        });
        writer.dedent();

        writer.indent();
        this.writeMethods({ writer, methods: this.getMethodsByAccess(Access.Public) });
        writer.dedent();

        writer.indent();
        this.writeMethods({ writer, methods: this.getMethodsByAccess(Access.Internal) });
        writer.dedent();

        writer.indent();
        this.writeMethods({ writer, methods: this.getMethodsByAccess(Access.Private) });
        writer.dedent();

        writer.indent();
        this.writeMethods({ writer, methods: this.getMethodsByAccess(undefined) });
        writer.dedent();

        writer.indent();
        this.operators.forEach((operator) => {
            this.writeOperator({ writer, operator });
            writer.newLine();
        });
        writer.dedent();

        writer.writeLine("}");
    }

    private writeConstructors({ writer, constructors }: { writer: Writer; constructors: Class.Constructor[] }): void {
        constructors.forEach((constructor, index) => {
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

    private writeMethods({ writer, methods }: { writer: Writer; methods: Method[] }): void {
        methods.forEach((method, index) => {
            method.write(writer);
            writer.writeNewLineIfLastLineNot();
            writer.newLine();
        });
    }

    private getMethodsByAccess(access: Access | undefined): Method[] {
        return this.methods.filter((method) => method.access === access);
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

    private getFieldsByAccess(access: Access | undefined): Field[] {
        return this.fields.filter((field) => field.access === access);
    }

    public getFields(): Field[] {
        return this.fields;
    }

    private writeOperator({ writer, operator }: { writer: Writer; operator: Class.Operator }): void {
        writer.write("public static ");
        if (operator.type === "explicit" || operator.type === "implicit") {
            writer.write(`${operator.type} `);
            writer.write("operator ");
            writer.write(`${this.name}(`);
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
