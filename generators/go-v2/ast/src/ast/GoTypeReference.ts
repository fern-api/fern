import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace GoTypeReference {
    interface Args {
        /* The name of the Go type */
        name: string;
        /* The import path of the Go type */
        importPath: string;
    }
}

export class GoTypeReference extends AstNode {
    public readonly name: string;
    public readonly importPath: string;

    constructor({ name, importPath }: GoTypeReference.Args) {
        super();
        this.name = name;
        this.importPath = importPath;
    }

    public write(writer: Writer): void {
        if (writer.importPath === this.importPath) {
            writer.write(this.name);
            return;
        }
        const alias = writer.addImport(this.importPath);
        writer.write(`${alias}.${this.name}`);
    }
}
