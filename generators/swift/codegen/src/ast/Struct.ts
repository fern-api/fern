import { AccessLevel } from "./AccessLevel";
import { AstNode, Writer } from "./core";
import type { EnumWithRawValues } from "./EnumWithRawValues";
import { Initializer } from "./Initializer";
import { Method } from "./Method";
import { Property } from "./Property";
import { Protocol } from "./Protocol";

export declare namespace Struct {
    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: Protocol[];
        properties: Property[];
        initializers?: Initializer[];
        methods?: Method[];
        nestedTypes?: (Struct | EnumWithRawValues)[];
    }
}

export class Struct extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances: string[];
    public readonly properties: Property[];
    public readonly initializers: Initializer[];
    public readonly methods: Method[];
    public readonly nestedTypes: (Struct | EnumWithRawValues)[];

    public constructor({
        accessLevel,
        name,
        conformances,
        properties,
        initializers,
        methods,
        nestedTypes
    }: Struct.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.properties = properties;
        this.initializers = initializers ?? [];
        this.methods = methods ?? [];
        this.nestedTypes = nestedTypes ?? [];
    }

    public write(writer: Writer): void {
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
        this.properties.forEach((property) => {
            property.write(writer);
            writer.newLine();
        });
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
