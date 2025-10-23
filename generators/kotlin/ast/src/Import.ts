import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export interface ImportArgs {
    path: string;
    alias?: string;
}

export class Import implements AstNode {
    public readonly path: string;
    public readonly alias?: string;

    constructor({ path, alias }: ImportArgs) {
        this.path = path;
        this.alias = alias;
    }

    public write(writer: Writer): void {
        writer.write("import ");
        writer.write(this.path);
        if (this.alias != null) {
            writer.write(" as ");
            writer.write(this.alias);
        }
    }
}
