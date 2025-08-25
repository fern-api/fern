import { AccessLevel } from "./AccessLevel";
import { AstNode, Writer } from "./core";
import { DocComment } from "./DocComment";
import { Protocol } from "./Protocol";
import { escapeSwiftStringLiteral, isReservedKeyword } from "./syntax";

export declare namespace EnumWithRawValues {
    interface Case {
        unsafeName: string;
        rawValue: string;
        docs?: DocComment;
    }

    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: (Protocol | "String")[];
        cases: Case[];
        docs?: DocComment;
    }
}

export class EnumWithRawValues extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances: (Protocol | "String")[];
    public readonly cases: EnumWithRawValues.Case[];
    public readonly docs?: DocComment;

    public constructor({ accessLevel, name, conformances, cases, docs }: EnumWithRawValues.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.cases = cases;
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
        writer.write(`enum ${this.name}`);
        this.conformances.forEach((conformance, index) => {
            if (index === 0) {
                writer.write(": ");
            } else if (index > 0) {
                writer.write(", ");
            }
            writer.write(conformance);
        });
        if (this.cases.length === 0) {
            writer.write(" {}");
            return;
        }
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
            if (case_.rawValue !== case_.unsafeName) {
                writer.write(" = ");
                writer.write(`"${escapeSwiftStringLiteral(case_.rawValue)}"`);
            }
            writer.newLine();
        });
        writer.dedent();
        writer.write("}");
    }
}
