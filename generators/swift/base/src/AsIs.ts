import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { entries } from "@fern-api/core-utils";
import { getFilename, RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Configuration specification for a static Swift file that gets included as-is in the generated SDK.
 * This serves as the raw configuration that gets transformed into a fully resolved {@link AsIsFileDefinition}
 * during the build process.
 */
interface AsIsFileSpec {
    relativePath: string;
    nodeNames?: string[];
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
        relativePath: "Core/Networking/HTTP.swift",
        nodeNames: ["HTTP"]
    },
    HttpClient: {
        relativePath: "Core/Networking/HTTPClient.swift",
        nodeNames: ["HTTPClient"]
    },
    QueryParameter: {
        relativePath: "Core/Networking/QueryParameter.swift",
        nodeNames: ["QueryParameter"]
    },

    // Core/Serde
    DecoderPlusAdditionalProperties: {
        relativePath: "Core/Serde/Decoder+AdditionalProperties.swift"
    },
    EncoderPlusAdditionalProperties: {
        relativePath: "Core/Serde/Encoder+AdditionalProperties.swift"
    },
    Serde: {
        relativePath: "Core/Serde/Serde.swift",
        nodeNames: ["Serde"]
    },
    StringKey: {
        relativePath: "Core/Serde/StringKey.swift",
        nodeNames: ["StringKey"]
    },

    // Core
    Prelude: {
        relativePath: "Core/Prelude.swift"
    },
    StringPlusUrlEncoding: {
        relativePath: "Core/String+URLEncoding.swift"
    },

    // Public
    APIErrorResponse: {
        relativePath: "Public/APIErrorResponse.swift",
        nodeNames: ["APIErrorResponse"]
    },
    ClientConfig: {
        relativePath: "Public/ClientConfig.swift",
        nodeNames: ["ClientConfig"]
    },
    ClientError: {
        relativePath: "Public/ClientError.swift",
        nodeNames: ["ClientError"]
    },
    JsonValue: {
        relativePath: "Public/JSONValue.swift",
        nodeNames: ["JSONValue"]
    },
    RequestOptions: {
        relativePath: "Public/RequestOptions.swift",
        nodeNames: ["RequestOptions"]
    }
} satisfies Record<string, AsIsFileSpec>;

/**
 * A fully resolved definition of a static Swift file, ready for use in codegen.
 */
export interface AsIsFileDefinition {
    /**
     * The filename (without directory path) of the Swift file.
     *
     * @example "HTTP.swift"
     */
    filename: string;

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
    nodeNames: string[];

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
        const { relativePath, nodeNames } = spec as AsIsFileSpec;
        const filename = getFilename(RelativeFilePath.of(relativePath));
        if (filename === undefined) {
            throw new Error(`Missing filename for as is file '${relativePath}'`);
        }
        result[key] = {
            filename,
            directory: RelativeFilePath.of(dirname(spec.relativePath)),
            nodeNames: nodeNames ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "asIs", filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
