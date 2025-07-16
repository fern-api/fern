import { SourceFile } from 'ts-morph'

import { ModuleSpecifier } from '../referencing/ModuleSpecifier'

export interface ImportDeclaration {
    namespaceImport?: string
    namedImports?: (string | NamedImport)[]
    defaultImport?: string
}

export interface NamedImport {
    name: string
    alias?: string
}

interface CombinedImportDeclarations {
    namespaceImports: Set<string>
    namedImports: NamedImport[]
    defaultImports: Set<string>
}

export class ImportsManager {
    private packagePath: string | undefined

    private imports: Record<ModuleSpecifier, CombinedImportDeclarations> = {}

    public constructor({ packagePath }: { packagePath?: string }) {
        this.packagePath = packagePath
    }

    public addImportFromRoot(modulePath: string, importDeclaration: ImportDeclaration, packagePath?: string): void {
        if (packagePath) {
            packagePath += '/'
        } else {
            packagePath = this.packagePath ? `${this.packagePath}/` : ''
        }

        this.addImport(`@root/${packagePath}${modulePath}`, importDeclaration)
    }
    public addImportFromSrc(modulePath: string, importDeclaration: ImportDeclaration, packagePath?: string): void {
        if (packagePath) {
            packagePath += '/'
        } else {
            packagePath = this.packagePath ? `${this.packagePath}/` : ''
        }

        this.addImport(`@src/${packagePath}${modulePath}`, importDeclaration)
    }

    public addImport(moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration): void {
        const importsForModuleSpecifier = (this.imports[moduleSpecifier] ??= {
            namespaceImports: new Set(),
            namedImports: [],
            defaultImports: new Set()
        })

        if (importDeclaration.namespaceImport != null) {
            importsForModuleSpecifier.namespaceImports.add(importDeclaration.namespaceImport)
        }

        if (importDeclaration.namedImports != null) {
            for (const namedImport of importDeclaration.namedImports) {
                const convertedNamedImport = typeof namedImport === 'string' ? { name: namedImport } : namedImport
                if (
                    !importsForModuleSpecifier.namedImports.some(
                        (otherNamedImport) =>
                            otherNamedImport.name === convertedNamedImport.name &&
                            otherNamedImport.alias === convertedNamedImport.alias
                    )
                ) {
                    importsForModuleSpecifier.namedImports.push(convertedNamedImport)
                }
            }
        }

        if (importDeclaration.defaultImport != null) {
            importsForModuleSpecifier.defaultImports.add(importDeclaration.defaultImport)
        }
    }

    public writeImportsToSourceFile(sourceFile: SourceFile): void {
        const sourceFileDirPath = sourceFile.getDirectoryPath()
        const sourcePathSegments = sourceFileDirPath.split('/').filter((segment) => segment.length > 0)
        for (const [originalModuleSpecifier, combinedImportDeclarations] of Object.entries(this.imports)) {
            let moduleSpecifier = originalModuleSpecifier
            if (moduleSpecifier.startsWith('@root/')) {
                const targetPath = moduleSpecifier.replace('@root/', '')
                const targetPathSegments = targetPath.split('/').filter((segment) => segment.length > 0)
                // Find common prefix
                let commonPrefixLength = 0
                const minLength = Math.min(sourcePathSegments.length, targetPathSegments.length)
                while (
                    commonPrefixLength < minLength &&
                    sourcePathSegments[commonPrefixLength] === targetPathSegments[commonPrefixLength]
                ) {
                    commonPrefixLength++
                }
                const upSteps = sourcePathSegments.length - commonPrefixLength
                let relativePath
                if (upSteps === 0 && targetPathSegments.slice(commonPrefixLength).length === 0) {
                    // Same directory
                    relativePath = '.'
                } else {
                    relativePath = [...Array(upSteps).fill('..'), ...targetPathSegments.slice(commonPrefixLength)].join(
                        '/'
                    )

                    // If there are no ".." segments, add a "./" prefix
                    if (!relativePath.startsWith('..') && upSteps === 0) {
                        relativePath = './' + relativePath
                    }
                }
                moduleSpecifier = relativePath
            }

            const namespaceImports = [...combinedImportDeclarations.namespaceImports]
            if (namespaceImports.length > 1) {
                throw new Error(
                    `Multiple namespace imports from ${moduleSpecifier} in ${sourceFile.getFilePath()}: ${namespaceImports.join(
                        ', '
                    )}`
                )
            }
            if (combinedImportDeclarations.defaultImports.size > 1) {
                throw new Error(`Multiple default imports from ${moduleSpecifier} in ${sourceFile.getFilePath()}`)
            }

            const namespaceImport = namespaceImports[0]
            if (namespaceImport != null) {
                sourceFile.addImportDeclaration({
                    moduleSpecifier,
                    namespaceImport
                })
            }

            const defaultImport = [...combinedImportDeclarations.defaultImports][0]
            if (defaultImport != null || combinedImportDeclarations.namedImports.length > 0) {
                sourceFile.addImportDeclaration({
                    moduleSpecifier,
                    defaultImport,
                    namedImports: [...combinedImportDeclarations.namedImports].sort().map((namedImport) => ({
                        name: namedImport.name,
                        alias: namedImport.alias
                    }))
                })
            }
        }
    }
}
