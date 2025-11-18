import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { swift } from "@fern-api/swift-codegen";

/**
 * A fully resolved definition of a static Swift file, ready for use in codegen.
 */
export interface AsIsFileDefinition {
    /**
     * The filename (without directory path) of the Swift file.
     */
    filenameWithoutExtension: string;

    /**
     * The relative directory path where this file should be placed in the generated project.
     *
     * @example RelativeFilePath.of("Core/Networking")
     */
    directory: RelativeFilePath;

    /**
     * The symbols (classes, structs, enums, protocols, etc.) that this file introduces to the project namespace.
     */
    symbols: { name: string; shape: swift.TypeSymbolShape }[];

    /**
     * Asynchronously loads the contents of the Swift file from disk.
     *
     * @returns Promise that resolves to the raw Swift source code as a string
     */
    loadContents: () => Promise<string>;
}

/**
 * Union type of all available static file identifiers.
 */
export type SourceAsIsFileId = keyof typeof swift.SourceAsIsFileSpecs;

/**
 * Mapped type that provides strongly-typed access to all static file definitions.
 *
 * Each key corresponds to an {@link SourceAsIsFileId} and maps to its resolved
 * {@link AsIsFileDefinition}.
 */
export type SourceAsIsFileDefinitionsById = {
    [K in SourceAsIsFileId]: AsIsFileDefinition;
};

/**
 * Registry of all static Swift files available for inclusion in generated SDKs.
 *
 * This constant provides access to resolved file definitions that can be used
 * by code generators to include pre-written Swift files in the output.
 *
 * @example
 * ```typescript
 * // Access a specific file
 * const httpFile = AsIsFiles.Http;
 * const content = await httpFile.loadContents();
 *
 * // Iterate over all files
 * for (const [id, definition] of Object.entries(AsIsFiles)) {
 *   console.log(`${id}: ${definition.filename}`);
 * }
 * ```
 */
export const SourceAsIsFiles = createSourceAsIsFiles();

/**
 * Transforms the raw file specifications into fully resolved file definitions.
 */
function createSourceAsIsFiles(): SourceAsIsFileDefinitionsById {
    const result = {} as SourceAsIsFileDefinitionsById;

    for (const [key, spec] of entries(swift.SourceAsIsFileSpecs)) {
        const { relativePathToDir, filenameWithoutExtension, symbols } =
            spec as swift.AsIsFileSpec<swift.AsIsSymbolName>;
        result[key] = {
            filenameWithoutExtension,
            directory: RelativeFilePath.of(relativePathToDir),
            symbols: symbols ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "asIs", "Sources", filenameWithoutExtension + ".swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}

const TestAsIsFileSpecs: Record<string, swift.AsIsFileSpec<string>> = {};

export type TestAsIsFileId = keyof typeof TestAsIsFileSpecs;

export type TestAsIsFileDefinitionsById = {
    [K in TestAsIsFileId]: AsIsFileDefinition;
};

export const TestAsIsFiles = createTestAsIsFiles();

function createTestAsIsFiles(): TestAsIsFileDefinitionsById {
    const result = {} as TestAsIsFileDefinitionsById;

    for (const [key, spec] of entries(TestAsIsFileSpecs)) {
        const { relativePathToDir, filenameWithoutExtension, symbols } = spec as swift.AsIsFileSpec<string>;
        result[key] = {
            filenameWithoutExtension,
            directory: RelativeFilePath.of(relativePathToDir),
            symbols: symbols ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "asIs", "Tests", filenameWithoutExtension + ".swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
