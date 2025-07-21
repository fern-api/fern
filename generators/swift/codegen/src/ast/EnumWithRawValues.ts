import { AccessLevel } from "./AccessLevel";
import { Protocol } from "./Protocol";
import { AstNode, Writer } from "./core";
import { escapeSwiftStringLiteral, isReservedKeyword } from "./syntax";

export declare namespace EnumWithRawValues {
    interface Case {
        unsafeName: string;
        rawValue: string;
    }

    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: (Protocol | "String")[];
        cases: Case[];
    }
}

export class EnumWithRawValues extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances?: (Protocol | "String")[];
    public readonly cases: EnumWithRawValues.Case[];

    public constructor({ accessLevel, name, conformances, cases }: EnumWithRawValues.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances;
        this.cases = cases;
    }

    public write(writer: Writer): void {
        if (this.accessLevel != null) {
            writer.write(this.accessLevel);
            writer.write(" ");
        }
        writer.write(`enum ${this.name}`);
        this.conformances?.forEach((conformance, index) => {
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
