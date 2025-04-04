import { Project } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

// Define the possible import modifications
const ImportModification = {
    NONE: "none",
    ADD_JS_EXTENSION: "add_js_extension",
    REPLACE_TS_WITH_JS: "replace_ts_with_js",
    ADD_INDEX_JS: "add_index_js"
} as const;

type ImportModificationType = (typeof ImportModification)[keyof typeof ImportModification];

export async function fixImportsForEsm(pathToProject: AbsoluteFilePath): Promise<void> {
    const project = new Project({
        tsConfigFilePath: join(pathToProject, RelativeFilePath.of("tsconfig.json"))
    });

    // Create caches for performance
    const importModificationCache = new Map<string, ImportModificationType>();
    const fileExistenceCache = new Map<string, string>();

    // Build file existence map for faster lookups
    for (const file of project.getSourceFiles()) {
        fileExistenceCache.set(file.getFilePath(), "");
    }

    for (const sourceFile of project.getSourceFiles()) {
        const allDeclarations = [...sourceFile.getImportDeclarations(), ...sourceFile.getExportDeclarations()];

        for (const importDecl of allDeclarations) {
            const moduleSpecifier = importDecl.getModuleSpecifierValue();

            // Skip if not a relative import or already has .js extension
            if (!moduleSpecifier || !moduleSpecifier.startsWith(".") || moduleSpecifier.endsWith(".js")) {
                continue;
            }

            // Check cache or determine modification type
            const normalizedPath = getNormalizedPath(moduleSpecifier, sourceFile.getFilePath());
            let modification = importModificationCache.get(normalizedPath);

            if (!modification) {
                modification = determineModification(moduleSpecifier, sourceFile.getFilePath(), fileExistenceCache);
                importModificationCache.set(normalizedPath, modification);
            }

            // Apply modification if needed
            if (modification !== ImportModification.NONE) {
                const newSpecifier = getModifiedSpecifier(moduleSpecifier, modification);
                importDecl.setModuleSpecifier(newSpecifier);
            }
        }
    }

    await project.save();
}

// Get the modified import specifier based on modification type
function getModifiedSpecifier(moduleSpecifier: string, modification: ImportModificationType): string {
    switch (modification) {
        case ImportModification.ADD_INDEX_JS:
            return `${moduleSpecifier}/index.js`;
        case ImportModification.ADD_JS_EXTENSION:
            return `${moduleSpecifier}.js`;
        case ImportModification.REPLACE_TS_WITH_JS:
            return moduleSpecifier.slice(0, -3) + ".js";
        default:
            return moduleSpecifier;
    }
}

// Get a normalized path for consistent cache keys
function getNormalizedPath(moduleSpecifier: string, currentFilePath: string): string {
    const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf("/"));
    return join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier)).toString();
}

// Determine import modification using file existence heuristics
function determineModification(
    moduleSpecifier: string,
    currentFilePath: string,
    fileExistenceCache: Map<string, string>
): ImportModificationType {
    // Case 1: Import with explicit .ts extension
    if (moduleSpecifier.endsWith(".ts")) {
        return ImportModification.REPLACE_TS_WITH_JS;
    }

    const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf("/"));

    // Case 2: Directory import with index file
    const dirPath = join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier));

    if (
        fileExistenceCache.has(join(dirPath, RelativeFilePath.of("index.ts")).toString()) ||
        fileExistenceCache.has(join(dirPath, RelativeFilePath.of("index.js")).toString())
    ) {
        return ImportModification.ADD_INDEX_JS;
    }

    // Case 3: Regular .ts file import
    const tsFilePath = join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier + ".ts")).toString();

    if (fileExistenceCache.has(tsFilePath)) {
        return ImportModification.ADD_JS_EXTENSION;
    }

    return ImportModification.NONE;
}
