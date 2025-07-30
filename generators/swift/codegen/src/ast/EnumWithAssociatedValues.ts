import { AccessLevel } from "./AccessLevel";
import { Protocol } from "./Protocol";
import { Type } from "./Type";
import { AstNode, Writer } from "./core";
import { isReservedKeyword } from "./syntax";

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
    }
}

export class EnumWithAssociatedValues extends AstNode {
    public readonly name: string;
    public readonly accessLevel?: AccessLevel;
    public readonly conformances: Protocol[];
    public readonly cases: EnumWithAssociatedValues.Case[];

    public constructor({ accessLevel, name, conformances, cases }: EnumWithAssociatedValues.Args) {
        super();
        this.name = name;
        this.accessLevel = accessLevel;
        this.conformances = conformances ?? [];
        this.cases = cases;
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
        writer.dedent();
        writer.write("}");
    }
}
