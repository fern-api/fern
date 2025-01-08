import Swift, { FileHeader, Import } from "../";
import { AstNode, Writer } from "./core";

export declare namespace File {
    interface Args {
        fileHeader?: FileHeader;
        imports?: Import[];
        node: AstNode;
    }
}

export class File extends AstNode {
    public readonly fileHeader?: FileHeader;
    public readonly imports?: Import[];
    public readonly node: AstNode;

    constructor({ fileHeader, imports, node }: File.Args) {
        super();
        this.fileHeader = fileHeader;
        this.imports = imports;
        this.node = node;
    }

    public write(writer: Writer): void {
        // e.g. // ClassName.swift...
        if (this.fileHeader) {
            writer.writeNode(this.fileHeader);
            writer.newLine();
        }

        // e.g. import Foundation
        if (this.imports) {
            this.imports.forEach((imp) => {
                writer.writeNode(imp);
            });
            writer.newLine();
        }

        writer.writeNode(this.node);

        // Common for swift files to have an extra line at end
        writer.newLine();
    }
}
