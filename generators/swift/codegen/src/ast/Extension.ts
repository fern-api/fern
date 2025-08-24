import { AstNode, Writer } from "./core";
import { DocComment } from "./DocComment";
import type { EnumWithRawValues } from "./EnumWithRawValues";
import { Initializer } from "./Initializer";
import { Method } from "./Method";
import { Protocol } from "./Protocol";
import { Struct } from "./Struct";

export declare namespace Extension {
    interface Args {
        name: string;
        conformances?: Protocol[];
        initializers?: Initializer[];
        methods?: Method[];
        nestedTypes?: (Struct | EnumWithRawValues)[];
        docs?: DocComment;
    }
}

export class Extension extends AstNode {
    public readonly name: string;
    public readonly conformances: string[];
    public readonly initializers: Initializer[];
    public readonly methods: Method[];
    public readonly nestedTypes: (Struct | EnumWithRawValues)[];
    public readonly docs?: DocComment;

    public constructor({ name, conformances, initializers, methods, nestedTypes, docs }: Extension.Args) {
        super();
        this.name = name;
        this.conformances = conformances ?? [];
        this.initializers = initializers ?? [];
        this.methods = methods ?? [];
        this.nestedTypes = nestedTypes ?? [];
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        writer.write(`extension ${this.name}`);
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
        if (this.initializers.length > 0) {
            writer.newLine();
            this.initializers.forEach((initializer, initializerIdx) => {
                if (initializerIdx > 0) {
                    writer.newLine();
                }
                initializer.write(writer);
                writer.newLine();
            });
        }
        if (this.methods.length > 0) {
            writer.newLine();
            this.methods.forEach((method, methodIdx) => {
                if (methodIdx > 0) {
                    writer.newLine();
                }
                method.write(writer);
                writer.newLine();
            });
        }
        if (this.nestedTypes.length > 0) {
            writer.newLine();
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
