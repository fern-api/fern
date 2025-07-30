import { AccessLevel } from "./AccessLevel";
import { Initializer } from "./Initializer";
import { Method } from "./Method";
import { Property } from "./Property";
import { Protocol } from "./Protocol";
import { AstNode, Writer } from "./core";

export declare namespace Class {
    interface Args {
        name: string;
        final?: true;
        accessLevel?: AccessLevel;
        conformances?: Protocol[];
        properties: Property[];
        initializers?: Initializer[];
        methods?: Method[];
    }
}

export class Class extends AstNode {
    public readonly name: string;
    public readonly final?: true;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances: Protocol[];
    public readonly properties: Property[];
    public readonly initializers: Initializer[];
    public readonly methods: Method[];

    public constructor({ accessLevel, name, final, conformances, properties, initializers, methods }: Class.Args) {
        super();
        this.name = name;
        this.final = final;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.properties = properties;
        this.initializers = initializers ?? [];
        this.methods = methods ?? [];
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        if (this.final) {
            writer.write("final ");
        }
        writer.write(`class ${this.name}`);
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
        writer.dedent();
        writer.write("}");
    }
}
