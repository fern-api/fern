import { SourceFile } from "ts-morph";

type ModuleSpecifier = string;
type NamedImportName = string;
type NamedImportAlias = string;

export interface ImportDeclaration {
    moduleSpecifier: ModuleSpecifier;
    namespaceImport?: string;
    namedImports?: (string | NamedImport)[];
    defaultImport?: string;
}

export interface NamedImport {
    name: string;
    alias?: string;
}

interface ImportsForModule {
    moduleSpecifier: ModuleSpecifier;
    namespaceImports: string[];
    namedImports: Record<NamedImportName, NamedImportAlias>;
    defaultImports: string[];
}

export class SourceFileManager {
    private imports: Record<ModuleSpecifier, ImportsForModule> = {};
    constructor(private _file: SourceFile) {}

    public get file(): SourceFile {
        // TODO before returning, change addImportDeclaration and getFullText to throw
        return this._file;
    }

    public addImportDeclaration(importDeclaration: ImportDeclaration): void {
        let importsForModule = this.imports[importDeclaration.moduleSpecifier];
        if (importsForModule == null) {
            importsForModule = {
                moduleSpecifier: importDeclaration.moduleSpecifier,
                namespaceImports: [],
                namedImports: {},
                defaultImports: [],
            };
            this.imports[importDeclaration.moduleSpecifier] = importsForModule;
        }

        if (importDeclaration.namespaceImport != null) {
            importsForModule.namespaceImports.push(importDeclaration.namespaceImport);
        }
        if (importDeclaration.namedImports != null) {
            for (const namedImport of importDeclaration.namedImports) {
                const name = typeof namedImport === "string" ? namedImport : namedImport.name;
                const alias = typeof namedImport === "string" ? namedImport : namedImport.alias ?? namedImport.name;
                importsForModule.namedImports[name] = alias;
            }
        }
        if (importDeclaration.defaultImport != null) {
            importsForModule.defaultImports.push(importDeclaration.defaultImport);
        }
    }

    public getFullText(): string {
        let fullText = "";

        const sortedImports = Object.values(this.imports).sort((a, b) =>
            a.moduleSpecifier < b.moduleSpecifier ? -1 : 1
        );
        for (const importDeclaration of sortedImports) {
            for (const namespaceImport of importDeclaration.namespaceImports) {
                fullText += `import * as ${namespaceImport} from "${importDeclaration.moduleSpecifier}";\n`;
            }

            const sortedNamedImports = Object.entries(importDeclaration.namedImports)
                .map(([name, alias]) => ({ name, alias }))
                .sort((a, b) => (a.name < b.name ? -1 : 1));
            if (sortedNamedImports.length > 0) {
                const namedImportsStr = sortedNamedImports
                    .map((namedImport) =>
                        namedImport.alias != null
                            ? `${namedImport.name} as ${namedImport.alias}`
                            : `${namedImport.name}`
                    )
                    .join(", ");
                fullText += `import { ${namedImportsStr} } from "${importDeclaration.moduleSpecifier}";\n`;
            }
            for (const defaultImport of importDeclaration.defaultImports) {
                fullText += `import ${defaultImport} from "${importDeclaration.moduleSpecifier}";\n`;
            }
        }

        fullText += "\n";
        fullText += this._file.getFullText();

        return fullText;
    }
}
