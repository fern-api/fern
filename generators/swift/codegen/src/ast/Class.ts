import { AccessLevel } from "./AccessLevel";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { FileHeader } from "./FileHeader";
import { Import } from "./Import";

export declare namespace Class {
    interface Args {
        fileHeader?: FileHeader;
        imports?: Import[];
        accessLevel: AccessLevel;
        name: string;
    }
}

export class Class extends AstNode {

    public readonly fileHeader?: FileHeader;
    public readonly imports: Import[];
    public readonly accessLevel: AccessLevel;
    public readonly name: string;

    constructor({ 
        fileHeader = undefined, 
        imports = [], 
        accessLevel = AccessLevel.Internal, 
        name 
    }: Class.Args) {
        super();
        this.fileHeader = fileHeader;
        this.imports = imports;
        this.accessLevel = accessLevel;
        this.name = name;
    }

    public write(writer: Writer): void {

        // e.g. // ClassName.swift ...
        if (this.fileHeader) {
            writer.writeNode(this.fileHeader);
        }

        // e.g. import PackageName
        this.imports.forEach(imp => {
            writer.writeNode(imp);
        });

        // Add line break if needed
        if (this.imports) {
            writer.newLine();
        }

        // e.g. public class ClassName {
        writer.write(`${this.accessLevel} class ${this.name} {`);

        writer.newLine();

            writer.openIndent();

            writer.write("// Put code here");

                writer.openIndent();

                writer.write("// Another indent");

                writer.closeIndent();

            writer.closeIndent();

        writer.newLine();

        writer.write("}");

        // Common for swift classes to have an extra line at bottom of file
        writer.newLine();

    }
}
