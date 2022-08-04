import { SourceFile } from "ts-morph";
import { ModuleSpecifier } from "../types";

export interface ImportDeclaration {
    namespaceImport?: string;
    namedImports?: string[];
    defaultImport?: string;
}

interface CombinedImportDeclarations {
    namespaceImports: Set<string>;
    namedImports: Set<string>;
    defaultImports: Set<string>;
}

export class ImportsManager {
    private imports: Record<ModuleSpecifier, CombinedImportDeclarations> = {};

    public addImport(moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration): void {
        const importsForModuleSpecifier = (this.imports[moduleSpecifier] ??= {
            namespaceImports: new Set(),
            namedImports: new Set(),
            defaultImports: new Set(),
        });

        if (importDeclaration.namespaceImport != null) {
            importsForModuleSpecifier.namespaceImports.add(importDeclaration.namespaceImport);
        }

        if (importDeclaration.namedImports != null) {
            for (const namedImport of importDeclaration.namedImports) {
                importsForModuleSpecifier.namedImports.add(namedImport);
            }
        }

        if (importDeclaration.defaultImport != null) {
            importsForModuleSpecifier.defaultImports.add(importDeclaration.defaultImport);
        }
    }

    public writeImportsToSourceFile(sourceFile: SourceFile): void {
        for (const [moduleSpecifier, combinedImportDeclarations] of Object.entries(this.imports)) {
            const namespaceImports = [...combinedImportDeclarations.namespaceImports];
            if (namespaceImports.length > 1) {
                throw new Error(
                    `Multiple namespace imports from ${moduleSpecifier} in ${sourceFile.getFilePath()}: ${namespaceImports.join(
                        ", "
                    )}`
                );
            }
            if (combinedImportDeclarations.defaultImports.size > 1) {
                throw new Error(`Multiple default imports from ${moduleSpecifier} in ${sourceFile.getFilePath()}`);
            }

            const namespaceImport = namespaceImports[0];
            if (namespaceImport != null) {
                sourceFile.addImportDeclaration({
                    moduleSpecifier,
                    namespaceImport,
                });
            }

            const defaultImport = [...combinedImportDeclarations.defaultImports][0];
            if (defaultImport != null || combinedImportDeclarations.namedImports.size > 0) {
                sourceFile.addImportDeclaration({
                    moduleSpecifier,
                    defaultImport,
                    namedImports: [...combinedImportDeclarations.namedImports].sort(),
                });
            }
        }
    }
}
