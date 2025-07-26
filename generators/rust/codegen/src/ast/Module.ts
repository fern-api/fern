import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Struct } from "./Struct";
import { ImplBlock } from "./ImplBlock";
import { Enum } from "./Enum";
import { UseStatement } from "./UseStatement";
import { ModuleDeclaration } from "./ModuleDeclaration";

export declare namespace Module {
    interface Args {
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
    public readonly imports?: string[];
    public readonly useStatements?: UseStatement[];
    public readonly moduleDeclarations?: ModuleDeclaration[];
    public readonly structs?: Struct[];
    public readonly implBlocks?: ImplBlock[];
    public readonly enums?: Enum[];
    public readonly rawDeclarations?: string[];

    public constructor({
        imports,
        useStatements,
        moduleDeclarations,
        structs,
        implBlocks,
        enums,
        rawDeclarations
    }: Module.Args) {
        super();
        this.imports = imports;
        this.useStatements = useStatements;
        this.moduleDeclarations = moduleDeclarations;
        this.structs = structs;
        this.implBlocks = implBlocks;
        this.enums = enums;
        this.rawDeclarations = rawDeclarations;
    }

    public write(writer: Writer): void {
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
