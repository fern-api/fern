import path from 'path'
import { Project, SyntaxKind } from 'ts-morph'

import { AbsoluteFilePath, RelativeFilePath, join } from '@fern-api/fs-utils'

// Define the possible import modifications
const ImportModification = {
    NONE: 'none',
    ADD_JS_EXTENSION: 'add_js_extension',
    REPLACE_TS_WITH_JS: 'replace_ts_with_js',
    ADD_INDEX_JS: 'add_index_js'
} as const

type ImportModificationType = (typeof ImportModification)[keyof typeof ImportModification]

/**
 * Fixes imports in a TypeScript project to ensure compatibility with ESM (ECMAScript Modules).
 *
 * TypeScript's `tsc` compiler does not generate valid ESM unless the source code follows specific conventions:
 * - All imports must include the `.js` extension.
 * - Folder imports must explicitly reference `index.js`.
 *
 * This function modifies the imports in the project to adhere to these conventions by:
 * - Adding `.js` extensions to imports where necessary.
 * - Replacing folder imports with explicit `index.js` imports.
 * - Ensuring compatibility with the generated ESM output.
 *
 * @param pathToProject - The absolute path to the root of the TypeScript project.
 */
export async function fixImportsForEsm(pathToProject: AbsoluteFilePath): Promise<void> {
    const project = new Project({
        tsConfigFilePath: join(pathToProject, RelativeFilePath.of('tsconfig.json'))
    })

    // Create caches for performance
    const importModificationCache = new Map<string, ImportModificationType>()
    const fileExistenceCache = new Set<string>()

    // Build file existence map for faster lookups
    for (const file of project.getSourceFiles()) {
        fileExistenceCache.add(file.getFilePath())
    }

    for (const sourceFile of project.getSourceFiles()) {
        // Handle static imports and exports
        const allDeclarations = [...sourceFile.getImportDeclarations(), ...sourceFile.getExportDeclarations()]

        for (const importDecl of allDeclarations) {
            const moduleSpecifier = importDecl.getModuleSpecifierValue()

            // Skip if not a relative import or already has .js extension
            if (!moduleSpecifier || !moduleSpecifier.startsWith('.') || moduleSpecifier.endsWith('.js')) {
                continue
            }

            // Check cache or determine modification type
            const normalizedPath = getNormalizedPath(moduleSpecifier, sourceFile.getFilePath())
            let modification = importModificationCache.get(normalizedPath)

            if (!modification) {
                modification = determineModification(moduleSpecifier, sourceFile.getFilePath(), fileExistenceCache)
                importModificationCache.set(normalizedPath, modification)
            }

            // Apply modification if needed
            if (modification !== ImportModification.NONE) {
                const newSpecifier = getModifiedSpecifier(moduleSpecifier, modification)
                importDecl.setModuleSpecifier(newSpecifier)
            }
        }

        // Handle dynamic imports - highly optimized for large projects
        // First check if file even contains 'import(' to skip files without dynamic imports
        const sourceText = sourceFile.getFullText()
        if (!sourceText.includes('import(')) {
            continue
        }

        // Only get call expressions, then filter for import calls
        const importCalls = sourceFile
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((callExpression) => callExpression.getExpression().getKind() === SyntaxKind.ImportKeyword)

        for (const callExpression of importCalls) {
            const args = callExpression.getArguments()
            if (args.length === 0) {
                continue
            }
            const firstArg = args[0]
            if (!firstArg) {
                continue
            }
            if (firstArg.getKind() !== SyntaxKind.StringLiteral) {
                continue
            }
            const stringLiteral = firstArg.asKindOrThrow(SyntaxKind.StringLiteral)
            const moduleSpecifier = stringLiteral.getLiteralValue()

            // Skip if not a relative import or already has .js extension
            if (!moduleSpecifier || !moduleSpecifier.startsWith('.') || moduleSpecifier.endsWith('.js')) {
                continue
            }

            // Check cache or determine modification type
            const normalizedPath = getNormalizedPath(moduleSpecifier, sourceFile.getFilePath())
            let modification = importModificationCache.get(normalizedPath)

            if (!modification) {
                modification = determineModification(moduleSpecifier, sourceFile.getFilePath(), fileExistenceCache)
                importModificationCache.set(normalizedPath, modification)
            }

            // Apply modification if needed
            if (modification !== ImportModification.NONE) {
                const newSpecifier = getModifiedSpecifier(moduleSpecifier, modification)
                stringLiteral.replaceWithText(`"${newSpecifier}"`)
            }
        }
    }

    await project.save()
}

// Get the modified import specifier based on modification type
function getModifiedSpecifier(moduleSpecifier: string, modification: ImportModificationType): string {
    switch (modification) {
        case ImportModification.ADD_INDEX_JS:
            return `${moduleSpecifier}/index.js`
        case ImportModification.ADD_JS_EXTENSION:
            return `${moduleSpecifier}.js`
        case ImportModification.REPLACE_TS_WITH_JS:
            return moduleSpecifier.slice(0, -3) + '.js'
        default:
            return moduleSpecifier
    }
}

// Get a normalized path for consistent cache keys
function getNormalizedPath(moduleSpecifier: string, currentFilePath: string): string {
    const currentDir = path.dirname(currentFilePath)
    return join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier)).toString()
}

// Determine import modification using file existence heuristics
function determineModification(
    moduleSpecifier: string,
    currentFilePath: string,
    fileExistenceCache: Set<string>
): ImportModificationType {
    // Case 1: Import with explicit .ts extension
    if (moduleSpecifier.endsWith('.ts')) {
        return ImportModification.REPLACE_TS_WITH_JS
    }

    const currentDir = path.dirname(currentFilePath)

    // Case 2: Directory import with index file
    const dirPath = join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier))

    if (
        fileExistenceCache.has(join(dirPath, RelativeFilePath.of('index.ts')).toString()) ||
        fileExistenceCache.has(join(dirPath, RelativeFilePath.of('index.js')).toString())
    ) {
        return ImportModification.ADD_INDEX_JS
    }

    // Case 3: Regular .ts file import
    const tsFilePath = join(AbsoluteFilePath.of(currentDir), RelativeFilePath.of(moduleSpecifier + '.ts')).toString()

    if (fileExistenceCache.has(tsFilePath)) {
        return ImportModification.ADD_JS_EXTENSION
    }

    return ImportModification.NONE
}
