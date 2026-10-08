import { AbsoluteFilePath, dirname, doesPathExist, relative, resolve } from "@fern-api/fs-utils";

import { readdir } from "fs/promises";
import { sep } from "path";
import { Rule, RuleViolation } from "../../Rule.js";

interface NavigationReferences {
    folders: Set<string>;
    pages: Set<string>;
    libraries: Set<string>;
}

interface LibraryOutput {
    name: string;
    outputDir: AbsoluteFilePath;
}

/**
 * Generated library docs (`fern docs md generate`) write one folder per symbol category
 * (`functions/`, `macros/`, ...). When a site wires those folders into navigation one by
 * one and misses a category, every generated cross-link into that category 404s. Warn
 * when a navigation tree references some, but not all, top-level folders of a library's
 * output directory.
 */
export const LibraryFoldersInNavigationRule: Rule = {
    name: "library-folders-in-navigation",
    create: ({ workspace }) => {
        const libraries = workspace.config.libraries;
        if (libraries == null) {
            return {};
        }
        const docsDir = dirname(workspace.absoluteFilepathToDocsConfig);
        const outputs: LibraryOutput[] = Object.entries(libraries).map(([name, config]) => ({
            name,
            outputDir: resolve(docsDir, config.output.path)
        }));

        return {
            file: ({ config }) =>
                checkNavigation({ navigation: config.navigation, configDir: docsDir, outputs, docsDir }),
            versionFile: ({ path, content }) => checkNestedFile(path, content),
            productFile: ({ path, content }) => checkNestedFile(path, content)
        };

        function checkNestedFile(path: string, content: unknown): Promise<RuleViolation[]> {
            return checkNavigation({
                navigation: isRecord(content) ? content.navigation : undefined,
                configDir: dirname(resolve(docsDir, path)),
                outputs,
                docsDir
            });
        }
    }
};

async function checkNavigation({
    navigation,
    configDir,
    outputs,
    docsDir
}: {
    navigation: unknown;
    configDir: AbsoluteFilePath;
    outputs: LibraryOutput[];
    docsDir: AbsoluteFilePath;
}): Promise<RuleViolation[]> {
    if (navigation == null) {
        return [];
    }
    const refs: NavigationReferences = { folders: new Set(), pages: new Set(), libraries: new Set() };
    collectNavigationReferences(navigation, configDir, refs);

    const violations: RuleViolation[] = [];
    for (const { name, outputDir } of outputs) {
        if (refs.libraries.has(name) || !(await doesPathExist(outputDir))) {
            continue;
        }
        const categoryDirs = await listGeneratedFolders(outputDir);
        const covered = categoryDirs.filter((dir) => isCovered(dir, refs));
        if (covered.length === 0 || covered.length === categoryDirs.length) {
            continue;
        }
        const missing = categoryDirs.filter((dir) => !isCovered(dir, refs));
        for (const dir of missing) {
            violations.push({
                severity: "warning",
                message:
                    `Generated folder '${relative(docsDir, dir)}' of library '${name}' is not in navigation, ` +
                    `so generated links into it will 404. Add a 'folder: ${relative(configDir, dir)}' item ` +
                    `(or point a 'folder:' item at '${relative(configDir, outputDir)}', or use 'library: ${name}').`
            });
        }
    }
    return violations;
}

async function listGeneratedFolders(outputDir: AbsoluteFilePath): Promise<AbsoluteFilePath[]> {
    const entries = await readdir(outputDir, { withFileTypes: true }).catch(() => []);
    return entries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("_"))
        .map((entry) => resolve(outputDir, entry.name))
        .sort();
}

function isCovered(dir: AbsoluteFilePath, refs: NavigationReferences): boolean {
    for (const folder of refs.folders) {
        if (isSameOrInside(dir, folder) || isSameOrInside(folder, dir)) {
            return true;
        }
    }
    for (const page of refs.pages) {
        if (isSameOrInside(page, dir)) {
            return true;
        }
    }
    return false;
}

function isSameOrInside(path: string, ancestor: string): boolean {
    const normalizedPath = path.split(sep).join("/");
    const normalizedAncestor = ancestor.split(sep).join("/");
    return normalizedPath === normalizedAncestor || normalizedPath.startsWith(`${normalizedAncestor}/`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function collectNavigationReferences(node: unknown, configDir: AbsoluteFilePath, refs: NavigationReferences): void {
    if (Array.isArray(node)) {
        for (const item of node) {
            collectNavigationReferences(item, configDir, refs);
        }
        return;
    }
    if (!isRecord(node)) {
        return;
    }
    if (typeof node.folder === "string") {
        refs.folders.add(resolve(configDir, node.folder));
    }
    if (typeof node.page === "string" && typeof node.path === "string") {
        refs.pages.add(resolve(configDir, node.path));
    }
    if (typeof node.library === "string") {
        refs.libraries.add(node.library);
    }
    for (const value of Object.values(node)) {
        if (typeof value === "object" && value != null) {
            collectNavigationReferences(value, configDir, refs);
        }
    }
}
