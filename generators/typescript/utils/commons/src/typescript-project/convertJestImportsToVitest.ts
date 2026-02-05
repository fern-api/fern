import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";
import { Project, SyntaxKind } from "ts-morph";

export async function convertJestImportsToVitest(
    pathToProject: AbsoluteFilePath,
    testsPath: RelativeFilePath
): Promise<void> {
    const project = new Project({
        tsConfigFilePath: path.join(pathToProject, testsPath, "tsconfig.json"),
        skipAddingFilesFromTsConfig: true
    });

    // Use ts-morph to add all test files under the test directory
    project.addSourceFilesAtPaths(path.join(pathToProject, testsPath, "**/*.ts"));
    const testFiles = project.getSourceFiles();
    for (const sourceFile of testFiles) {
        // Track if we need to add Mock/MockInstance imports
        let needsMock = false;
        let needsMockInstance = false;

        // 0. Replace import { ... } from "@jest/globals" with import { ... } from "vitest"
        sourceFile.getImportDeclarations().forEach((importDecl) => {
            const moduleSpecifier = importDecl.getModuleSpecifierValue();
            if (moduleSpecifier === "@jest/globals") {
                importDecl.setModuleSpecifier("vitest");
            }
        });

        // 1. Replace jest.Mock with Mock
        sourceFile.forEachDescendant((node) => {
            if (node.getKind() === SyntaxKind.TypeReference && node.getText().startsWith("jest.Mock")) {
                node.replaceWithText("Mock");
                needsMock = true;
            }
        });

        // 2. Replace jest.SpyInstance with MockInstance
        sourceFile.forEachDescendant((node) => {
            if (node.getKind() === SyntaxKind.TypeReference && node.getText().startsWith("jest.SpyInstance")) {
                node.replaceWithText("MockInstance");
                needsMockInstance = true;
            }
        });

        // 3. Add Mock/MockInstance to vitest import if needed
        if (needsMock || needsMockInstance) {
            const vitestImport = sourceFile.getImportDeclaration("vitest");
            const importsToAdd = [];
            if (vitestImport) {
                const namedImports = vitestImport.getNamedImports();
                const existingNames = namedImports.map((ni) => ni.getName());

                if (needsMock && !existingNames.includes("Mock")) {
                    importsToAdd.push("Mock");
                }
                if (needsMockInstance && !existingNames.includes("MockInstance")) {
                    importsToAdd.push("MockInstance");
                }

                if (importsToAdd.length > 0) {
                    vitestImport.addNamedImports(importsToAdd);
                }
            } else {
                // No vitest import exists, create one
                if (needsMock) {
                    importsToAdd.push("Mock");
                }
                if (needsMockInstance) {
                    importsToAdd.push("MockInstance");
                }

                sourceFile.addImportDeclaration({
                    moduleSpecifier: "vitest",
                    namedImports: importsToAdd
                });
            }
        }

        // 4. Replace jest.useFakeTimers({ doNotFake: ["nextTick"] }) with vi.useFakeTimers({...})
        sourceFile.forEachDescendant((node) => {
            if (
                node.getKind() === SyntaxKind.CallExpression &&
                node.getText().replace(/\s/g, "") === 'jest.useFakeTimers({doNotFake:["nextTick"]})'
            ) {
                node.replaceWithText(
                    `vi.useFakeTimers({
	toFake: [
		"setTimeout",
		"clearTimeout",
		"setInterval",
		"clearInterval",
		"setImmediate",
		"clearImmediate",
		"Date",
		"performance",
		"requestAnimationFrame",
		"cancelAnimationFrame",
		"requestIdleCallback",
		"cancelIdleCallback"
	]
})`
                );
            }
        });

        // 5. Replace all remaining 'jest' with 'vi'
        // (after special cases above)
        const fullText = sourceFile.getFullText();
        // Only replace if there are still 'jest' occurrences
        if (/\bjest\b/.test(fullText)) {
            const replaced = fullText.replace(/\bjest\b/g, "vi");
            sourceFile.replaceWithText(replaced);
        }
    }
    await project.save();
}
