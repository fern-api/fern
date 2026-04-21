import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

const VITEST_FAKE_TIMERS = `vi.useFakeTimers({
\ttoFake: [
\t\t"setTimeout",
\t\t"clearTimeout",
\t\t"setInterval",
\t\t"clearInterval",
\t\t"setImmediate",
\t\t"clearImmediate",
\t\t"Date",
\t\t"performance",
\t\t"requestAnimationFrame",
\t\t"cancelAnimationFrame",
\t\t"requestIdleCallback",
\t\t"cancelIdleCallback"
\t]
})`;

export async function convertJestImportsToVitest(
    pathToProject: AbsoluteFilePath,
    testsPath: RelativeFilePath
): Promise<void> {
    const testsDir = path.join(pathToProject, testsPath);
    const tsFiles: string[] = [];
    await collectTsFiles(testsDir, tsFiles);

    for (const filePath of tsFiles) {
        let content = await readFile(filePath, "utf-8");
        let modified = false;

        // 0. Replace import from "@jest/globals" with "vitest"
        const jestGlobalsReplaced = content.replace(/(from\s+["'])@jest\/globals(["'])/g, "$1vitest$2");
        if (jestGlobalsReplaced !== content) {
            content = jestGlobalsReplaced;
            modified = true;
        }

        // 1+2. Check if we need Mock or MockInstance types
        const needsMock = /\bjest\.Mock\b/.test(content);
        const needsMockInstance = /\bjest\.SpyInstance\b/.test(content);

        // Replace jest.Mock with Mock, jest.SpyInstance with MockInstance
        if (needsMock) {
            content = content.replace(/\bjest\.Mock\b/g, "Mock");
            modified = true;
        }
        if (needsMockInstance) {
            content = content.replace(/\bjest\.SpyInstance\b/g, "MockInstance");
            modified = true;
        }

        // 3. Add Mock/MockInstance to vitest import if needed
        if (needsMock || needsMockInstance) {
            const importsToAdd: string[] = [];
            if (needsMock) {
                importsToAdd.push("Mock");
            }
            if (needsMockInstance) {
                importsToAdd.push("MockInstance");
            }

            // Find existing vitest import and add to it
            const vitestImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*["']vitest["']/);
            if (vitestImportMatch) {
                const existingImports =
                    vitestImportMatch[1]
                        ?.split(",")
                        .map((s) => s.trim())
                        .filter(Boolean) ?? [];
                const newImports = importsToAdd.filter((i) => !existingImports.includes(i));
                if (newImports.length > 0) {
                    const allImports = [...existingImports, ...newImports].join(", ");
                    content = content.replace(vitestImportMatch[0], `import { ${allImports} } from "vitest"`);
                    modified = true;
                }
            } else {
                // No vitest import — add one at the top
                content = `import { ${importsToAdd.join(", ")} } from "vitest";\n` + content;
                modified = true;
            }
        }

        // 4. Replace jest.useFakeTimers({ doNotFake: ["nextTick"] })
        const fakeTimersPattern = /jest\.useFakeTimers\(\s*\{\s*doNotFake\s*:\s*\[\s*"nextTick"\s*\]\s*\}\s*\)/g;
        const fakeTimersReplaced = content.replace(fakeTimersPattern, VITEST_FAKE_TIMERS);
        if (fakeTimersReplaced !== content) {
            content = fakeTimersReplaced;
            modified = true;
        }

        // 5. Replace all remaining 'jest' with 'vi'
        if (/\bjest\b/.test(content)) {
            content = content.replace(/\bjest\b/g, "vi");
            modified = true;
        }

        if (modified) {
            await writeFile(filePath, content);
        }
    }
}

async function collectTsFiles(dirPath: string, result: string[]): Promise<void> {
    let entries;
    try {
        entries = await readdir(dirPath, { withFileTypes: true });
    } catch {
        return; // tests directory might not exist
    }
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            await collectTsFiles(fullPath, result);
        } else if (entry.name.endsWith(".ts")) {
            result.push(fullPath);
        }
    }
}
