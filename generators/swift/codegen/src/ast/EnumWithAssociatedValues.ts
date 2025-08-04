import { AccessLevel } from "./AccessLevel";
import { AstNode, Writer } from "./core";
import { EnumWithRawValues } from "./EnumWithRawValues";
import { Initializer } from "./Initializer";
import { Method } from "./Method";
import { Protocol } from "./Protocol";
import { Struct } from "./Struct";
import { isReservedKeyword } from "./syntax";
import { Type } from "./Type";

export declare namespace EnumWithAssociatedValues {
    interface Case {
        unsafeName: string;
        associatedValue: [Type, ...Type[]];
    }

    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: Protocol[];
        cases: Case[];
        initializers?: Initializer[];
        methods?: Method[];
        nestedTypes?: (EnumWithRawValues | Struct)[];
    }
}

export class EnumWithAssociatedValues extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances: Protocol[];
    public readonly cases: EnumWithAssociatedValues.Case[];
    public readonly initializers: Initializer[];
    public readonly methods: Method[];
    public readonly nestedTypes: (EnumWithRawValues | Struct)[];

    public constructor({
        accessLevel,
        name,
        conformances,
        cases,
        initializers,
        methods,
        nestedTypes
    }: EnumWithAssociatedValues.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.cases = cases;
        this.initializers = initializers ?? [];
        this.methods = methods ?? [];
        this.nestedTypes = nestedTypes ?? [];
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write(`enum ${this.name}`);
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
        this.cases.forEach((case_) => {
            writer.write("case ");
            if (isReservedKeyword(case_.unsafeName)) {
                writer.write(`\`${case_.unsafeName}\``);
            } else {
                writer.write(case_.unsafeName);
            }
            writer.write("(");
            case_.associatedValue.forEach((type, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                type.write(writer);
            });
            writer.write(")");
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
