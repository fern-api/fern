import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";

export type AsIsSymbolName =
    | "JSONValue"
    | "CalendarDate"
    | "HTTP"
    | "HTTPClient"
    | "MultipartFormData"
    | "MultipartFormDataConvertible"
    | "MultipartFormField"
    | "QueryParameter"
    | "EncodableValue"
    | "Serde"
    | "StringKey"
    | "APIErrorResponse"
    | "ClientConfig"
    | "ClientError"
    | "FormFile"
    | "Nullable"
    | "RequestOptions";

/**
 * Configuration specification for a static Swift file that gets included as-is in the generated SDK.
 * This serves as the raw configuration that gets transformed into a fully resolved {@link AsIsFileDefinition}
 * during the build process.
 */
interface AsIsFileSpec<S extends string> {
    relativePathToDir: string;
    filenameWithoutExtension: string;
    symbolNames?: S[];
}

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
     * The names of Swift symbols (classes, structs, enums, protocols, etc.)
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
 * Registry of all static Swift file specifications.
 *
 * This constant defines the complete catalog of pre-written Swift files that can be
 * included in generated SDKs. Each entry maps a unique identifier to a file specification
 * containing the file's intended path and exported symbols.
 */
const SourceAsIsFileSpecs = {
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
    MultipartFormData: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "MultipartFormData",
        symbolNames: ["MultipartFormData"]
    },
    MultipartFormDataConvertible: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "MultipartFormDataConvertible",
        symbolNames: ["MultipartFormDataConvertible"]
    },
    MultipartFormField: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "MultipartFormField",
        symbolNames: ["MultipartFormField"]
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
    EncodableValue: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "EncodableValue",
        symbolNames: ["EncodableValue"]
    },
    EncoderPlusAdditionalProperties: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "Encoder+AdditionalProperties"
    },
    JSONEncoderPlusEncodableValue: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "JSONEncoder+EncodableValue"
    },
    KeyedDecodingContainerPlusNullable: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "KeyedDecodingContainer+Nullable"
    },
    KeyedEncodingContainerPlusNullable: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "KeyedEncodingContainer+Nullable"
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
    CalendarDate: {
        relativePathToDir: "Core",
        filenameWithoutExtension: "CalendarDate",
        symbolNames: ["CalendarDate"]
    },
    DataPlusString: {
        relativePathToDir: "Core",
        filenameWithoutExtension: "Data+String"
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
    FormFile: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "FormFile",
        symbolNames: ["FormFile"]
    },
    JsonValue: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "JSONValue",
        symbolNames: ["JSONValue"]
    },
    Nullable: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "Nullable",
        symbolNames: ["Nullable"]
    },
    RequestOptions: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "RequestOptions",
        symbolNames: ["RequestOptions"]
    }
} satisfies Record<string, AsIsFileSpec<AsIsSymbolName>>;

/**
 * Union type of all available static file identifiers.
 */
export type SourceAsIsFileId = keyof typeof SourceAsIsFileSpecs;

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

    for (const [key, spec] of entries(SourceAsIsFileSpecs)) {
        const { relativePathToDir, filenameWithoutExtension, symbolNames } = spec as AsIsFileSpec<AsIsSymbolName>;
        result[key] = {
            filenameWithoutExtension,
            directory: RelativeFilePath.of(relativePathToDir),
            symbolNames: symbolNames ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "asIs", "Sources", filenameWithoutExtension + ".swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}

const TestAsIsFileSpecs = {
    // Wire/Utilities
    WireStub: {
        relativePathToDir: "Wire/Utilities",
        filenameWithoutExtension: "WireStub",
        symbolNames: ["WireStub"]
    }
} satisfies Record<string, AsIsFileSpec<string>>;

export type TestAsIsFileId = keyof typeof TestAsIsFileSpecs;

export type TestAsIsFileDefinitionsById = {
    [K in TestAsIsFileId]: AsIsFileDefinition;
};

export const TestAsIsFiles = createTestAsIsFiles();

function createTestAsIsFiles(): TestAsIsFileDefinitionsById {
    const result = {} as TestAsIsFileDefinitionsById;

    for (const [key, spec] of entries(TestAsIsFileSpecs)) {
        const { relativePathToDir, filenameWithoutExtension, symbolNames } = spec as AsIsFileSpec<string>;
        result[key] = {
            filenameWithoutExtension,
            directory: RelativeFilePath.of(relativePathToDir),
            symbolNames: symbolNames ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "asIs", "Tests", filenameWithoutExtension + ".swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
