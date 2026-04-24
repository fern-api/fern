import { SourceFile } from "ts-morph";

import { ModuleSpecifier } from "../referencing/ModuleSpecifier.js";

export interface ImportDeclaration {
    namespaceImport?: string;
    namedImports?: (string | NamedImport)[];
    defaultImport?: string;
}

export interface NamedImport {
    name: string;
    alias?: string;
    type?: "type" | undefined;
}

export namespace NamedImport {
    export function isTypeImport(namedImport: string | NamedImport): boolean {
        return typeof namedImport !== "string" && namedImport.type === "type";
    }
}

interface CombinedImportDeclarations {
    namespaceImports: Set<string>;
    namedImports: NamedImport[];
    defaultImports: Set<string>;
}

/**
 * Returns the import group for a module specifier following Biome's sorting rules:
 * 1. Node built-ins with protocol (node:fs)
 * 2. External packages (react, lodash)
 * 3. Aliased paths (@/, #, ~, $)
 * 4. Relative imports (./, ../)
 */
function getImportGroup(moduleSpecifier: string): number {
    if (moduleSpecifier.startsWith("node:")) {
        return 1;
    }
    if (moduleSpecifier.startsWith("./") || moduleSpecifier.startsWith("../") || moduleSpecifier === ".") {
        return 4;
    }
    if (/^[@#~$]/.test(moduleSpecifier)) {
        return 3;
    }
    return 2; // External packages
}

/**
 * Compares two module specifiers following Biome's sorting rules:
 * - First by group (node built-ins, external packages, aliased paths, relative imports)
 * - Then alphabetically within each group
 */
function compareModuleSpecifiers(a: string, b: string): number {
    const groupA = getImportGroup(a);
    const groupB = getImportGroup(b);
    if (groupA !== groupB) {
        return groupA - groupB;
    }
    return a.localeCompare(b);
}

export class ImportsManager {
    private packagePath: string | undefined;

    private imports: Record<ModuleSpecifier, CombinedImportDeclarations> = {};

    public constructor({ packagePath }: { packagePath?: string }) {
        this.packagePath = packagePath;
    }

    public addImportFromRoot(modulePath: string, importDeclaration: ImportDeclaration, packagePath?: string): void {
        if (packagePath) {
            packagePath += "/";
        } else {
            packagePath = this.packagePath ? `${this.packagePath}/` : "";
        }

        this.addImport(`@root/${packagePath}${modulePath}`, importDeclaration);
    }

    public addImport(moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration): void {
        const importsForModuleSpecifier = (this.imports[moduleSpecifier] ??= {
            namespaceImports: new Set(),
            namedImports: [],
            defaultImports: new Set()
        });

        if (importDeclaration.namespaceImport != null) {
            importsForModuleSpecifier.namespaceImports.add(importDeclaration.namespaceImport);
        }

        if (importDeclaration.namedImports != null) {
            for (const namedImport of importDeclaration.namedImports) {
                const convertedNamedImport = typeof namedImport === "string" ? { name: namedImport } : namedImport;
                if (
                    !importsForModuleSpecifier.namedImports.some(
                        (otherNamedImport) =>
                            otherNamedImport.name === convertedNamedImport.name &&
                            otherNamedImport.alias === convertedNamedImport.alias
                    )
                ) {
                    importsForModuleSpecifier.namedImports.push(convertedNamedImport);
                }
            }
        }

        if (importDeclaration.defaultImport != null) {
            importsForModuleSpecifier.defaultImports.add(importDeclaration.defaultImport);
        }
    }

    private resolveModuleSpecifier(originalModuleSpecifier: string, sourcePathSegments: string[]): string {
        if (!originalModuleSpecifier.startsWith("@root/")) {
            return originalModuleSpecifier;
        }

        const targetPath = originalModuleSpecifier.replace("@root/", "");
        const targetPathSegments = targetPath.split("/").filter((segment) => segment.length > 0);

        // Find common prefix
        let commonPrefixLength = 0;
        const minLength = Math.min(sourcePathSegments.length, targetPathSegments.length);
        while (
            commonPrefixLength < minLength &&
            sourcePathSegments[commonPrefixLength] === targetPathSegments[commonPrefixLength]
        ) {
            commonPrefixLength++;
        }

        const upSteps = sourcePathSegments.length - commonPrefixLength;
        if (upSteps === 0 && targetPathSegments.slice(commonPrefixLength).length === 0) {
            // Same directory
            return ".";
        }

        let relativePath = [...Array(upSteps).fill(".."), ...targetPathSegments.slice(commonPrefixLength)].join("/");

        // If there are no ".." segments, add a "./" prefix
        if (!relativePath.startsWith("..") && upSteps === 0) {
            relativePath = "./" + relativePath;
        }

        return relativePath;
    }

    /**
     * Builds the import block text for a source file without modifying the AST.
     * Returns the import text string (with trailing newlines) or empty string if no imports.
     */
    public buildImportText(sourceFile: SourceFile): string {
        const sourceFileDirPath = sourceFile.getDirectoryPath();
        const sourcePathSegments = sourceFileDirPath.split("/").filter((segment) => segment.length > 0);

        // Pre-compute final module specifiers and sort using Biome's rules
        const resolvedImports = Object.entries(this.imports).map(
            ([originalModuleSpecifier, combinedImportDeclarations]) => ({
                moduleSpecifier: this.resolveModuleSpecifier(originalModuleSpecifier, sourcePathSegments),
                combinedImportDeclarations
            })
        );

        resolvedImports.sort((a, b) => compareModuleSpecifiers(a.moduleSpecifier, b.moduleSpecifier));

        const importLines: string[] = [];

        for (const { moduleSpecifier, combinedImportDeclarations } of resolvedImports) {
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
                importLines.push(`import * as ${namespaceImport} from "${moduleSpecifier}";`);
            }

            const defaultImport = [...combinedImportDeclarations.defaultImports][0];
            if (defaultImport != null || combinedImportDeclarations.namedImports.length > 0) {
                const isRootTypeOnly = [defaultImport, ...combinedImportDeclarations.namedImports]
                    .filter<NamedImport | string>((i) => i != null)
                    .every(NamedImport.isTypeImport);

                const typeKeyword = isRootTypeOnly ? "type " : "";
                const parts: string[] = [];

                if (defaultImport != null) {
                    parts.push(defaultImport);
                }

                if (combinedImportDeclarations.namedImports.length > 0) {
                    const namedParts = [...combinedImportDeclarations.namedImports]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((namedImport) => {
                            const typePrefix = !isRootTypeOnly && NamedImport.isTypeImport(namedImport) ? "type " : "";
                            const name = `${typePrefix}${namedImport.name}`;
                            return namedImport.alias != null ? `${name} as ${namedImport.alias}` : name;
                        });
                    parts.push(`{ ${namedParts.join(", ")} }`);
                }

                importLines.push(`import ${typeKeyword}${parts.join(", ")} from "${moduleSpecifier}";`);
            }
        }

        if (importLines.length > 0) {
            return importLines.join("\n") + "\n\n";
        }
        return "";
    }

    public writeImportsToSourceFile(sourceFile: SourceFile): void {
        const importText = this.buildImportText(sourceFile);
        if (importText.length > 0) {
            sourceFile.insertText(0, importText);
        }
    }
}
