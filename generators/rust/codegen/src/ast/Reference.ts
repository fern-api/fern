import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export class Reference extends AstNode {
    private name: string;
    private module?: string;
    private genericArgs?: AstNode[];

    constructor({ name, module, genericArgs }: { name: string; module?: string; genericArgs?: AstNode[] }) {
        super();
        this.name = name;
        this.module = module;
        this.genericArgs = genericArgs;
    }

    public write(writer: Writer): void {
        if (this.module) {
            writer.write(`${this.module}::`);
        }
        writer.write(this.name);
        if (this.genericArgs && this.genericArgs.length > 0) {
            writer.write("<");
            this.genericArgs.forEach((arg, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                arg.write(writer);
            });
            writer.write(">");
        }
    }

    public getImportPath(): string | undefined {
        return this.module;
    }

    public getName(): string {
        return this.name;
    }
}
