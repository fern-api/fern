import { AstNode } from "./core/AstNode";

export class TypeLiteral extends AstNode {
    private value: string;

    private constructor(value: string) {
        super();
        this.value = value;
    }

    public static string(value: string): TypeLiteral {
        return new TypeLiteral(value);
    }

    public write(writer: import("./core/Writer").Writer): void {
        // For now, just write the string as a Ruby string literal
        if (this.value.includes("'")) {
            writer.write(`"${this.value.replaceAll('"', '\\"')}"`);
        } else {
            writer.write(`'${this.value}'`);
        }
    }
}
