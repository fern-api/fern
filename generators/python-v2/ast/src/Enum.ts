import { python } from ".";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export class EnumValue extends AstNode {
    constructor(
        private readonly name: string,
        private readonly value: string | number
    ) {
        super();
    }

    public write(writer: Writer): void {
        writer.write(`${this.name} = `);
        if (typeof this.value === "string") {
            writer.write(`"${this.value}"`);
        } else {
            writer.write(this.value.toString());
        }
    }
}

export class Enum extends AstNode {
    private readonly values: EnumValue[];

    constructor(
        private readonly name: string,
        values: Array<{ name: string; value: string | number }>
    ) {
        super();
        this.values = values.map((v) => new EnumValue(v.name, v.value));
        this.addReference(python.reference({ name: "Enum", modulePath: ["enum"] }));
    }

    public write(writer: Writer): void {
        writer.write(`class ${this.name}(Enum):`);
        writer.newLine();
        writer.indent();
        this.values.forEach((value) => {
            value.write(writer);
            writer.newLine();
        });
        writer.dedent();

        writer.write("def visit(");
        writer.newLine();
        writer.indent();
        writer.write("self,");
        writer.newLine();
        this.values.forEach((value, index) => {
            writer.write(`${value}: typing.Callable[[], T_Result]${index < this.values.length - 1 ? "," : ""}`);
            writer.newLine();
        });
        writer.write(") -> T_Result:");
        writer.newLine();
        writer.dedent();
        writer.indent();
        this.values.forEach((value) => {
            writer.write(`if self is ${this.name}.${value}:`);
            writer.newLine();
            writer.indent();
            writer.write(`return ${value}()`);
            writer.newLine();
            writer.dedent();
        });
        writer.dedent();
        writer.dedent();
    }
}
