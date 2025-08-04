import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Configuration specification for a static Swift file that gets included as-is in the generated SDK.
 * This serves as the raw configuration that gets transformed into a fully resolved {@link AsIsFileDefinition}
 * during the build process.
 */
interface AsIsFileSpec {
    relativePathToDir: string;
    filenameWithoutExtension: string;
    symbolNames?: string[];
}

/**
 * Registry of all static Swift file specifications.
 *
 * This constant defines the complete catalog of pre-written Swift files that can be
 * included in generated SDKs. Each entry maps a unique identifier to a file specification
 * containing the file's intended path and exported symbols.
 */
const AsIsFileSpecs = {
    // Core/Networking
    Http: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "HTTP",
        symbolNames: ["HTTP"]
    },
    HttpClient: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "HTTPClient",
        symbolNames: ["HTTPClient"]
    },
    QueryParameter: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "QueryParameter",
        symbolNames: ["QueryParameter"]
    },

    // Core/Serde
    DecoderPlusAdditionalProperties: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "Decoder+AdditionalProperties"
    },
    EncoderPlusAdditionalProperties: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "Encoder+AdditionalProperties"
    },
    Serde: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "Serde",
        symbolNames: ["Serde"]
    },
    StringKey: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "StringKey",
        symbolNames: ["StringKey"]
    },

    // Core
    Prelude: {
        relativePathToDir: "Core",
        filenameWithoutExtension: "Prelude"
    },
    StringPlusUrlEncoding: {
        relativePathToDir: "Core",
        filenameWithoutExtension: "String+URLEncoding"
    },

    // Public
    APIErrorResponse: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "APIErrorResponse",
        symbolNames: ["APIErrorResponse"]
    },
    ClientConfig: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "ClientConfig",
        symbolNames: ["ClientConfig"]
    },
    ClientError: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "ClientError",
        symbolNames: ["ClientError"]
    },
    JsonValue: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "JSONValue",
        symbolNames: ["JSONValue"]
    },
    RequestOptions: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "RequestOptions",
        symbolNames: ["RequestOptions"]
    }
} satisfies Record<string, AsIsFileSpec>;

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
     * The names of public Swift symbols (classes, structs, enums, protocols, etc.)
     * that this file introduces to the project namespace.
     */
    symbolNames: string[];

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
export type AsIsFileId = keyof typeof AsIsFileSpecs;

/**
 * Mapped type that provides strongly-typed access to all static file definitions.
 *
 * Each key corresponds to an {@link AsIsFileId} and maps to its resolved
 * {@link AsIsFileDefinition}.
 */
export type AsIsFileDefinitionsById = {
    [K in AsIsFileId]: AsIsFileDefinition;
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
export const AsIsFiles = createAsIsFiles();

/**
 * Transforms the raw file specifications into fully resolved file definitions.
 */
function createAsIsFiles(): AsIsFileDefinitionsById {
    const result = {} as AsIsFileDefinitionsById;

    for (const [key, spec] of entries(AsIsFileSpecs)) {
        const { relativePathToDir, filenameWithoutExtension, symbolNames } = spec as AsIsFileSpec;
        result[key] = {
            filenameWithoutExtension,
            directory: RelativeFilePath.of(relativePathToDir),
            symbolNames: symbolNames ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "asIs", filenameWithoutExtension + ".swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
