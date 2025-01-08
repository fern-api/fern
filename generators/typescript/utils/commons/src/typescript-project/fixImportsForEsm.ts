import { Project } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

export async function fixImportsForEsm(pathToProject: AbsoluteFilePath): Promise<void> {
    const project = new Project({
        tsConfigFilePath: join(pathToProject, RelativeFilePath.of("tsconfig.json"))
    });
    const typeChecker = project.getTypeChecker();
    project.getSourceFiles().forEach((sourceFile) => {
        // Get all imports in the file
        const imports = sourceFile.getImportDeclarations();
        const exports = sourceFile.getExportDeclarations();

        [...imports, ...exports].forEach((importDecl) => {
            const moduleSpecifier = importDecl.getModuleSpecifierValue();

            if (!moduleSpecifier) {
                return;
            }

            // Skip if it's not a relative import or already has .js extension
            if (!moduleSpecifier.startsWith(".") || moduleSpecifier.endsWith(".js")) {
                return;
            }

            // Get the referenced file path by using the TypeChecker
            const symbol = typeChecker.getSymbolAtLocation(importDecl.getModuleSpecifier()!);

            const symbolSourceFile = symbol?.getValueDeclaration()?.getSourceFile();
            if (symbolSourceFile) {
                const filePath = symbolSourceFile.getFilePath();
                let newSpecifier = moduleSpecifier;

                // Case 1: Directory import resolving to an index file
                if (
                    (filePath.endsWith("index.ts") || filePath.endsWith("index.js")) &&
                    !moduleSpecifier.endsWith("index") &&
                    !moduleSpecifier.endsWith(".ts") &&
                    !moduleSpecifier.endsWith(".js")
                ) {
                    newSpecifier = `${moduleSpecifier}/index.js`;
                }
                // Case 2: Regular .ts file import
                else if (filePath.endsWith(".ts") && !moduleSpecifier.endsWith(".ts")) {
                    newSpecifier = `${moduleSpecifier}.js`;
                }
                // Case 3: Import with explicit .ts extension
                else if (moduleSpecifier.endsWith(".ts")) {
                    newSpecifier = moduleSpecifier.replace(/\.ts$/, ".js");
                }

                if (newSpecifier !== moduleSpecifier) {
                    importDecl.setModuleSpecifier(newSpecifier);
                }
            }
        });
    });
    await project.save();
}
