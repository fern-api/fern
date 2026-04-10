import { isReservedKeyword } from "../syntax/index.js";
import { AccessLevel } from "./AccessLevel.js";
import { AstNode, Writer } from "./core/index.js";
import { DocComment } from "./DocComment.js";
import { EnumWithRawValues } from "./EnumWithRawValues.js";
import { Initializer } from "./Initializer.js";
import { Method } from "./Method.js";
import { Protocol } from "./Protocol.js";
import { Struct } from "./Struct.js";
import { TypeReference } from "./TypeReference.js";

export declare namespace EnumWithAssociatedValues {
    interface Case {
        unsafeName: string;
        associatedValue?: [TypeReference, ...TypeReference[]];
        docs?: DocComment;
    }

    interface Args {
        name: string;
        indirect?: boolean;
        accessLevel?: AccessLevel;
        conformances?: Protocol[];
        cases: Case[];
        initializers?: Initializer[];
        methods?: Method[];
        nestedTypes?: (EnumWithRawValues | Struct)[];
        docs?: DocComment;
    }
}

export class EnumWithAssociatedValues extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly indirect: boolean;
    public readonly conformances: Protocol[];
    public readonly cases: EnumWithAssociatedValues.Case[];
    public readonly initializers: Initializer[];
    public readonly methods: Method[];
    public readonly nestedTypes: (EnumWithRawValues | Struct)[];
    public readonly docs?: DocComment;

    public constructor({
        accessLevel,
        indirect,
        name,
        conformances,
        cases,
        initializers,
        methods,
        nestedTypes,
        docs
    }: EnumWithAssociatedValues.Args) {
        super();
        this.name = name;
        this.indirect = indirect ?? false;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.cases = cases;
        this.initializers = initializers ?? [];
        this.methods = methods ?? [];
        this.nestedTypes = nestedTypes ?? [];
        this.docs = docs;
    }

    public write(writer: Writer): void {
        if (this.docs != null) {
            this.docs.write(writer);
        }
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        if (this.indirect) {
            writer.write("indirect ");
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
            if (case_.docs != null) {
                case_.docs.write(writer);
            }
            writer.write("case ");
            if (isReservedKeyword(case_.unsafeName)) {
                writer.write(`\`${case_.unsafeName}\``);
            } else {
                writer.write(case_.unsafeName);
            }
            if (case_.associatedValue != null) {
                writer.write("(");
                case_.associatedValue.forEach((type, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    type.write(writer);
                });
                writer.write(")");
            }
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
