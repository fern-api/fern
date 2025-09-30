import { AccessLevel } from "./AccessLevel";
import { AstNode, Writer } from "./core";
import { DocComment } from "./DocComment";
import type { EnumWithRawValues } from "./EnumWithRawValues";
import { Expression } from "./Expression";
import { FunctionArgument } from "./FunctionArgument";
import { Initializer } from "./Initializer";
import { Method } from "./Method";
import { Property } from "./Property";
import { Protocol } from "./Protocol";

export declare namespace Struct {
    interface Attribute {
        name: string;
        arguments?: FunctionArgument[];
    }

    interface Args {
        attributes?: Attribute[];
        name: string;
        accessLevel?: AccessLevel;
        conformances?: Protocol[];
        properties: Property[];
        initializers?: Initializer[];
        methods?: Method[];
        nestedTypes?: (Struct | EnumWithRawValues)[];
        docs?: DocComment;
    }
}

export class Struct extends AstNode {
    public readonly attributes: Struct.Attribute[];
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances: string[];
    public readonly properties: Property[];
    public readonly initializers: Initializer[];
    public readonly methods: Method[];
    public readonly nestedTypes: (Struct | EnumWithRawValues)[];
    public readonly docs?: DocComment;

    public constructor({
        attributes,
        accessLevel,
        name,
        conformances,
        properties,
        initializers,
        methods,
        nestedTypes,
        docs
    }: Struct.Args) {
        super();
        this.attributes = attributes ?? [];
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.properties = properties ?? [];
        this.initializers = initializers ?? [];
        this.methods = methods ?? [];
        this.nestedTypes = nestedTypes ?? [];
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        this.attributes.forEach((attribute) => {
            if (attribute.arguments?.length) {
                Expression.functionCall({
                    unsafeName: `@${attribute.name}`,
                    arguments_: attribute.arguments
                }).write(writer);
            } else {
                writer.write("@");
                writer.write(attribute.name);
            }
            writer.write(" ");
        });
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write(`struct ${this.name}`);
        this.conformances.forEach((conformance, index) => {
            if (index === 0) {
                writer.write(": ");
            } else if (index > 0) {
                writer.write(", ");
            }
            writer.write(conformance);
        });
        writer.write(" {");
        writer.newLine();
        writer.indent();
        const hasProperties = this.properties.length > 0;
        const hasInitializers = this.initializers.length > 0;
        const hasMethods = this.methods.length > 0;
        const hasNestedTypes = this.nestedTypes.length > 0;
        this.properties.forEach((property) => {
            property.write(writer);
            writer.newLine();
        });
        let wroteMember = hasProperties;
        if (hasInitializers) {
            if (wroteMember) {
                writer.newLine();
            }
            this.initializers.forEach((initializer, initializerIdx) => {
                if (initializerIdx > 0) {
                    writer.newLine();
                }
                initializer.write(writer);
                writer.newLine();
            });
            wroteMember = true;
        }
        if (hasMethods) {
            if (wroteMember) {
                writer.newLine();
            }
            this.methods.forEach((method, methodIdx) => {
                if (methodIdx > 0) {
                    writer.newLine();
                }
                method.write(writer);
                writer.newLine();
            });
            wroteMember = true;
        }
        if (hasNestedTypes) {
            if (wroteMember) {
                writer.newLine();
            }
            this.nestedTypes.forEach((nestedType, nestedTypeIdx) => {
                if (nestedTypeIdx > 0) {
                    writer.newLine();
                }
                nestedType.write(writer);
                writer.newLine();
            });
        }
        writer.dedent();
        writer.write("}");
    }
}
