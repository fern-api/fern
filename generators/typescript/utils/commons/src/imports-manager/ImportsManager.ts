import { SourceFile } from "ts-morph";

import { ModuleSpecifier } from "../referencing/ModuleSpecifier";

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

export class ImportsManager {
    private packagePath: string | undefined;

    private imports: Record<ModuleSpecifier, CombinedImportDeclarations> = {};
    private reservedIdentifiers: Set<string> = new Set();
    private allocatedLocalNames: Set<string> = new Set();

    public constructor({ packagePath }: { packagePath?: string }) {
        this.packagePath = packagePath;
    }

    /**
     * Reserve a local identifier to prevent imports from using it.
     * This should be called for top-level declarations like client class names.
     */
    public reserveLocal(name: string): void {
        this.reservedIdentifiers.add(name);
        this.allocatedLocalNames.add(name);
    }

    /**
     * Ensure a named import is added and return the local name to use.
     * If the name conflicts with a reserved identifier, an alias will be used.
     */
    public ensureNamedImport({
        moduleSpecifier,
        name,
        isTypeOnly
    }: {
        moduleSpecifier: ModuleSpecifier;
        name: string;
        isTypeOnly?: boolean;
    }): string {
        const existingImports = this.imports[moduleSpecifier];
        if (existingImports != null) {
            const existingImport = existingImports.namedImports.find((namedImport) => namedImport.name === name);
            if (existingImport != null) {
                return existingImport.alias ?? name;
            }
        }

        const localName = this.getAvailableLocalName(name);
        const alias = localName !== name ? localName : undefined;

        this.addImport(moduleSpecifier, {
            namedImports: [
                {
                    name,
                    alias,
                    type: isTypeOnly ? "type" : undefined
                }
            ]
        });

        return localName;
    }

    /**
     * Get an available local name, adding a suffix if needed to avoid conflicts.
     */
    private getAvailableLocalName(preferredName: string): string {
        if (!this.reservedIdentifiers.has(preferredName) && !this.allocatedLocalNames.has(preferredName)) {
            this.allocatedLocalNames.add(preferredName);
            return preferredName;
        }

        const typeVariant = `${preferredName}Type`;
        if (!this.reservedIdentifiers.has(typeVariant) && !this.allocatedLocalNames.has(typeVariant)) {
            this.allocatedLocalNames.add(typeVariant);
            return typeVariant;
        }

        const underscoreVariant = `${preferredName}_`;
        if (!this.reservedIdentifiers.has(underscoreVariant) && !this.allocatedLocalNames.has(underscoreVariant)) {
            this.allocatedLocalNames.add(underscoreVariant);
            return underscoreVariant;
        }

        let counter = 1;
        while (true) {
            const numberedVariant = `${preferredName}${counter}`;
            if (!this.reservedIdentifiers.has(numberedVariant) && !this.allocatedLocalNames.has(numberedVariant)) {
                this.allocatedLocalNames.add(numberedVariant);
                return numberedVariant;
            }
            counter++;
        }
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

    public writeImportsToSourceFile(sourceFile: SourceFile): void {
        const sourceFileDirPath = sourceFile.getDirectoryPath();
        const sourcePathSegments = sourceFileDirPath.split("/").filter((segment) => segment.length > 0);
        for (const [originalModuleSpecifier, combinedImportDeclarations] of Object.entries(this.imports)) {
            let moduleSpecifier = originalModuleSpecifier;
            if (moduleSpecifier.startsWith("@root/")) {
                const targetPath = moduleSpecifier.replace("@root/", "");
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
                let relativePath;
                if (upSteps === 0 && targetPathSegments.slice(commonPrefixLength).length === 0) {
                    // Same directory
                    relativePath = ".";
                } else {
                    relativePath = [...Array(upSteps).fill(".."), ...targetPathSegments.slice(commonPrefixLength)].join(
                        "/"
                    );

                    // If there are no ".." segments, add a "./" prefix
                    if (!relativePath.startsWith("..") && upSteps === 0) {
                        relativePath = "./" + relativePath;
                    }
                }
                moduleSpecifier = relativePath;
            }

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
                    namespaceImport
                });
            }

            const defaultImport = [...combinedImportDeclarations.defaultImports][0];
            if (defaultImport != null || combinedImportDeclarations.namedImports.length > 0) {
                const isRootTypeOnly = [defaultImport, ...combinedImportDeclarations.namedImports]
                    .filter<NamedImport | string>((i) => i != null)
                    .every(NamedImport.isTypeImport);
                sourceFile.addImportDeclaration({
                    isTypeOnly: isRootTypeOnly,
                    moduleSpecifier,
                    defaultImport,
                    namedImports: [...combinedImportDeclarations.namedImports].sort().map((namedImport) => ({
                        name:
                            !isRootTypeOnly && NamedImport.isTypeImport(namedImport)
                                ? `type ${namedImport.name}`
                                : namedImport.name,
                        alias: namedImport.alias
                    }))
                });
            }
        }
    }
}
