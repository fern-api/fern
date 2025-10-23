import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export interface AnnotationArgs {
    name: string;
    arguments?: Record<string, string>;
}

export class Annotation implements AstNode {
    public readonly name: string;
    public readonly arguments: Record<string, string>;

    constructor({ name, arguments: args = {} }: AnnotationArgs) {
        this.name = name;
        this.arguments = args;
    }

    public write(writer: Writer): void {
        writer.write("@");
        writer.write(this.name);

        const argEntries = Object.entries(this.arguments);
        if (argEntries.length > 0) {
            writer.write("(");
            argEntries.forEach(([key, value], index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.write(`${key} = ${value}`);
            });
            writer.write(")");
        }
    }
}
