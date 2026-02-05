import { AstNode } from "./AstNode";
import { Enum } from "./Enum";
import { ImplBlock } from "./ImplBlock";
import { ModuleDeclaration } from "./ModuleDeclaration";
import { Struct } from "./Struct";
import { UseStatement } from "./UseStatement";
import { Writer } from "./Writer";

export declare namespace Module {
    interface Args {
        moduleDoc?: string[];
        imports?: string[];
        useStatements?: UseStatement[];
        moduleDeclarations?: ModuleDeclaration[];
        structs?: Struct[];
        implBlocks?: ImplBlock[];
        enums?: Enum[];
        rawDeclarations?: string[];
    }
}

export class Module extends AstNode {
    public readonly moduleDoc?: string[];
    public readonly imports?: string[];
    public readonly useStatements?: UseStatement[];
    public readonly moduleDeclarations?: ModuleDeclaration[];
    public readonly structs?: Struct[];
    public readonly implBlocks?: ImplBlock[];
    public readonly enums?: Enum[];
    public readonly rawDeclarations?: string[];

    public constructor({
        moduleDoc,
        imports,
        useStatements,
        moduleDeclarations,
        structs,
        implBlocks,
        enums,
        rawDeclarations
    }: Module.Args) {
        super();
        this.moduleDoc = moduleDoc;
        this.imports = imports;
        this.useStatements = useStatements;
        this.moduleDeclarations = moduleDeclarations;
        this.structs = structs;
        this.implBlocks = implBlocks;
        this.enums = enums;
        this.rawDeclarations = rawDeclarations;
    }

    public write(writer: Writer): void {
        // Write module documentation first
        if (this.moduleDoc && this.moduleDoc.length > 0) {
            this.moduleDoc.forEach((line) => {
                if (line === "") {
                    writer.writeLine("//!");
                } else {
                    writer.writeLine(`//! ${line}`);
                }
            });
            writer.newLine();
        }

        // Write imports (legacy string-based imports)
        if (this.imports && this.imports.length > 0) {
            this.imports.forEach((importStatement) => {
                writer.write(importStatement);
                writer.newLine();
            });
            writer.newLine();
        }

        // Write module declarations
        if (this.moduleDeclarations && this.moduleDeclarations.length > 0) {
            this.moduleDeclarations.forEach((moduleDecl) => {
                moduleDecl.write(writer);
                writer.newLine();
            });
            writer.newLine();
        }

        // Write use statements
        if (this.useStatements && this.useStatements.length > 0) {
            this.useStatements.forEach((useStmt) => {
                useStmt.write(writer);
                writer.newLine();
            });
            writer.newLine();
        }

        // Write structs
        if (this.structs && this.structs.length > 0) {
            this.structs.forEach((struct, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                struct.write(writer);
                writer.newLine();
            });
            writer.newLine();
        }

        // Write enums
        if (this.enums && this.enums.length > 0) {
            this.enums.forEach((enumDecl, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                enumDecl.write(writer);
                writer.newLine();
            });
            writer.newLine();
        }

        // Write impl blocks
        if (this.implBlocks && this.implBlocks.length > 0) {
            this.implBlocks.forEach((implBlock, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                implBlock.write(writer);
                writer.newLine();
            });
            writer.newLine();
        }

        // Write raw declarations (for unsafe impl Send/Sync, etc.)
        if (this.rawDeclarations && this.rawDeclarations.length > 0) {
            this.rawDeclarations.forEach((declaration) => {
                writer.write(declaration);
                writer.newLine();
            });
        }
    }
}
