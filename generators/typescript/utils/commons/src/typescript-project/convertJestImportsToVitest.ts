import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";
import { Project, SyntaxKind } from "ts-morph";

export async function convertJestImportsToVitest(pathToProject: AbsoluteFilePath): Promise<void> {
    // Find the test directory relative to the project root
    const testDir = join(pathToProject, RelativeFilePath.of("tests"));
    const testDirPath = testDir;

    const project = new Project({
        tsConfigFilePath: path.join(pathToProject, "tsconfig.json"),
        skipAddingFilesFromTsConfig: true
    });

    // Use ts-morph to add all test files under the test directory
    project.addSourceFilesAtPaths(path.join(testDirPath, "**/*.ts"));
    const testFiles = project.getSourceFiles();

    await Promise.all(
        testFiles.map(async (sourceFile) => {
            // 0. Replace import { ... } from "@jest/globals" with import { ... } from "vitest"
            sourceFile.getImportDeclarations().forEach((importDecl) => {
                const moduleSpecifier = importDecl.getModuleSpecifierValue();
                if (moduleSpecifier === "@jest/globals") {
                    importDecl.setModuleSpecifier("vitest");
                }
            });

            // 1. Replace jest.Mock with import("vitest").Mock
            sourceFile.forEachDescendant((node) => {
                if (node.getKind() === SyntaxKind.TypeReference && node.getText().startsWith("jest.Mock")) {
                    node.replaceWithText('import("vitest").Mock');
                }
            });

            // 2. Replace jest.SpyInstance with import("vitest").MockInstance
            sourceFile.forEachDescendant((node) => {
                if (node.getKind() === SyntaxKind.TypeReference && node.getText().startsWith("jest.SpyInstance")) {
                    node.replaceWithText('import("vitest").MockInstance');
                }
            });

            // 3. Replace jest.useFakeTimers({ doNotFake: ["nextTick"] }) with vi.useFakeTimers({...})
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

            // 4. Replace all remaining 'jest' with 'vi'
            // (after special cases above)
            const fullText = sourceFile.getFullText();
            // Only replace if there are still 'jest' occurrences
            if (/\bjest\b/.test(fullText)) {
                const replaced = fullText.replace(/\bjest\b/g, "vi");
                sourceFile.replaceWithText(replaced);
            }

            await sourceFile.save();
        })
    );
}
