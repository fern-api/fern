import { ImportDeclaration, ImportDeclarationStructure, OptionalKind, SourceFile } from "ts-morph";

export function getSourceFileAsText(file: SourceFile): string {
    mergeImportsInFile(file);
    file.formatText();
    return file.getFullText();
}

type ModuleSpecifier = string;
function mergeImportsInFile(file: SourceFile) {
    const imports: Record<ModuleSpecifier, OptionalKind<ImportDeclarationStructure>> = {};

    const importDeclarations = file.getImportDeclarations();
    for (const importDeclaration of importDeclarations) {
        const moduleSpecifier = importDeclaration.getModuleSpecifier().getLiteralText();
        imports[moduleSpecifier] = mergeImports(file, moduleSpecifier, importDeclaration, imports[moduleSpecifier]);
        importDeclaration.remove();
    }

    for (const importDeclaration of Object.values(imports)) {
        // add namespace import separately, since you can't combine a namespace imports with other imports

        if (importDeclaration.namespaceImport != null) {
            file.addImportDeclaration({
                ...importDeclaration,
                defaultImport: undefined,
                namedImports: undefined,
            });
        }

        const hasNamedImports = importDeclaration.namedImports != null && importDeclaration.namedImports.length > 0;
        if (importDeclaration.defaultImport != null || hasNamedImports) {
            file.addImportDeclaration({
                ...importDeclaration,
                namespaceImport: undefined,
            });
        }
    }
}

function mergeImports(
    file: SourceFile,
    moduleSpecifier: string,
    a: ImportDeclaration,
    b: OptionalKind<ImportDeclarationStructure> | undefined
): OptionalKind<ImportDeclarationStructure> {
    const aNamespaceImport = a.getNamespaceImport()?.getText();
    const bNamespaceImport = b?.namespaceImport;
    if (aNamespaceImport != null && bNamespaceImport != null && aNamespaceImport !== bNamespaceImport) {
        throw new Error(
            `${file.getBaseName()}: Found multiple namespace imports (${aNamespaceImport}, ${bNamespaceImport}) for ${moduleSpecifier}.`
        );
    }
    const namespaceImport = aNamespaceImport ?? bNamespaceImport;

    const aDefaultImport = a.getDefaultImport()?.getText();
    const bDefaultImport = b?.defaultImport;
    if (aDefaultImport != null && bDefaultImport != null && aDefaultImport != bDefaultImport) {
        throw new Error(
            `${file.getBaseName()}: Found multiple default imports (${aDefaultImport}, ${bDefaultImport}) for ${moduleSpecifier}.`
        );
    }
    const defaultImport = aDefaultImport ?? bDefaultImport;

    const namedImports = [
        ...new Set([
            ...a.getNamedImports().map((namedImport) => namedImport.getText()),
            ...(b?.namedImports != null
                ? typeof b.namedImports !== "function"
                    ? b.namedImports
                    : [b.namedImports]
                : []),
        ]),
    ];

    return {
        moduleSpecifier,
        namespaceImport,
        defaultImport,
        namedImports,
    };
}
