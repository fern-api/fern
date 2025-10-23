import { AstNode } from "./core/AstNode";
import { Writer } from "./Writer";

export interface ReferenceArgs {
    name: string;
    importPath?: string;
}

export class Reference implements AstNode {
    public readonly name: string;
    public readonly importPath?: string;

    constructor({ name, importPath }: ReferenceArgs) {
        this.name = name;
        this.importPath = importPath;
    }

    public write(writer: Writer): void {
        writer.write(this.name);
    }
}
