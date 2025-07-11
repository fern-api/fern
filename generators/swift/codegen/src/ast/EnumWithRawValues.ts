import { AccessLevel } from "./AccessLevel";
import { AstNode, Writer } from "./core";

export declare namespace EnumWithRawValues {
    interface Case {
        name: string;
        rawValue: string;
    }

    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: string[];
        cases: Case[];
    }
}

export class EnumWithRawValues extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances?: string[];
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
            writer.write(case_.name);
            if (case_.rawValue !== case_.name) {
                writer.write(" = ");
                writer.write(`"${case_.rawValue}"`);
            }

            writer.newLine();
        });
        writer.dedent();
        writer.write("}");
    }
}
