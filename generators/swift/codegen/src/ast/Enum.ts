import { AccessLevel } from "./AccessLevel";
import { Type } from "./Type";
import { AstNode, Writer } from "./core";

export declare namespace Enum {
    interface Case {
        name: string;
        associatedValues?: Type[];
    }

    interface Args {
        name: string;
        accessLevel?: AccessLevel;
        conformances?: string[];
        cases: Case[];
    }
}

export class Enum extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances?: string[];
    public readonly cases: Enum.Case[];

    public constructor({ accessLevel, name, conformances, cases }: Enum.Args) {
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
            if (case_.associatedValues?.length) {
                writer.write("(");
                case_.associatedValues.forEach((type, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    type.write(writer);
                });
                writer.write(")");
            }
            writer.newLine();
        });
        writer.dedent();
        writer.write("}");
    }
}
