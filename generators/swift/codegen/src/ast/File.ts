import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { FileHeader, Import, Type } from "../";
import { Struct } from "./Struct";

export declare namespace File {
    interface Args {
        fileHeader?: FileHeader;
        imports?: Import[];
        class: Type | Struct;
    }
}

export class File extends AstNode {

    public readonly fileHeader?: FileHeader;
    public readonly imports?: Import[];
    public readonly class: Type | Struct;

    constructor({ 
        fileHeader,
        imports,
        class: classInstance,
    }: File.Args) {
        super(Swift.indentSize);
        this.fileHeader = fileHeader;
        this.imports = imports;
        this.class = classInstance;
    }

    public write(writer: Writer): void {

        // e.g. // ClassName.swift...
        if (this.fileHeader) {
            writer.writeNode(this.fileHeader);
            writer.newLine();
        }
        
        // e.g. import Foundation
        if (this.imports) {
            this.imports.forEach(imp => {
                writer.writeNode(imp);
            });
            writer.newLine();
        }

        writer.writeNode(this.class);

        // Common for swift files to have an extra line at end
        writer.newLine();

    }
}
