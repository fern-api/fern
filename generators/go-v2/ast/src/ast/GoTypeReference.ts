import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Type } from "./Type.js";
import { writeGenerics } from "./utils/writeGenerics.js";

export declare namespace GoTypeReference {
    interface Args {
        /* The name of the Go type */
        name: string;
        /* The import path of the Go type */
        importPath?: string;
        /* The generic type parameters, if any */
        generics?: Type[] | undefined;
    }
}

export class GoTypeReference extends AstNode {
    public readonly name: string;
    public readonly importPath: string | undefined;
    public readonly generics: Type[] | undefined;

    constructor({ name, importPath, generics }: GoTypeReference.Args) {
        super();
        this.name = name;
        this.importPath = importPath;
        this.generics = generics;
    }

    public write(writer: Writer): void {
        if (this.importPath == null || writer.importPath === this.importPath) {
            writer.write(this.name);
            return;
        }
        const alias = writer.addImport(this.importPath);
        writer.write(`${alias}.${this.name}`);
        if (this.generics != null) {
            writeGenerics({ writer, generics: this.generics });
        }
    }
}
