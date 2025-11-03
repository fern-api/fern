import type { TypeSymbolShape } from "./symbol-registry";

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
export interface AsIsFileSpec<SymbolName extends string> {
    relativePathToDir: string;
    filenameWithoutExtension: string;
    symbols: { name: SymbolName; shape: TypeSymbolShape }[];
}

/**
 * Registry of all static Swift file specifications.
 *
 * This constant defines the complete catalog of pre-written Swift files that can be
 * included in generated SDKs. Each entry maps a unique identifier to a file specification
 * containing the file's intended path and exported symbols.
 */
export const SourceAsIsFileSpecs = {
    // Core/Networking
    Http: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "HTTP",
        symbols: [{ name: "HTTP", shape: { type: "enum-container" } }]
    },
    HttpClient: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "HTTPClient",
        symbols: [{ name: "HTTPClient", shape: { type: "class" } }]
    },
    MultipartFormData: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "MultipartFormData",
        symbols: [{ name: "MultipartFormData", shape: { type: "class" } }]
    },
    MultipartFormDataConvertible: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "MultipartFormDataConvertible",
        symbols: [{ name: "MultipartFormDataConvertible", shape: { type: "protocol" } }]
    },
    MultipartFormField: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "MultipartFormField",
        symbols: [{ name: "MultipartFormField", shape: { type: "enum-with-associated-values" } }]
    },
    QueryParameter: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "QueryParameter",
        symbols: [{ name: "QueryParameter", shape: { type: "enum-with-associated-values" } }]
    },
    // Core/Serde
    DecoderPlusAdditionalProperties: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "Decoder+AdditionalProperties",
        symbols: []
    },
    EncodableValue: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "EncodableValue",
        symbols: [{ name: "EncodableValue", shape: { type: "struct" } }]
    },
    EncoderPlusAdditionalProperties: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "Encoder+AdditionalProperties",
        symbols: []
    },
    JSONEncoderPlusEncodableValue: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "JSONEncoder+EncodableValue",
        symbols: []
    },
    KeyedDecodingContainerPlusNullable: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "KeyedDecodingContainer+Nullable",
        symbols: []
    },
    KeyedEncodingContainerPlusNullable: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "KeyedEncodingContainer+Nullable",
        symbols: []
    },
    Serde: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "Serde",
        symbols: [{ name: "Serde", shape: { type: "class" } }]
    },
    StringKey: {
        relativePathToDir: "Core/Serde",
        filenameWithoutExtension: "StringKey",
        symbols: [{ name: "StringKey", shape: { type: "struct" } }]
    },

    // Core
    CalendarDate: {
        relativePathToDir: "Core",
        filenameWithoutExtension: "CalendarDate",
        symbols: [{ name: "CalendarDate", shape: { type: "struct" } }]
    },
    DataPlusString: {
        relativePathToDir: "Core",
        filenameWithoutExtension: "Data+String",
        symbols: []
    },
    StringPlusUrlEncoding: {
        relativePathToDir: "Core",
        filenameWithoutExtension: "String+URLEncoding",
        symbols: []
    },

    // Public
    APIErrorResponse: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "APIErrorResponse",
        symbols: [{ name: "APIErrorResponse", shape: { type: "struct" } }]
    },
    ClientConfig: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "ClientConfig",
        symbols: [{ name: "ClientConfig", shape: { type: "class" } }]
    },
    ClientError: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "ClientError",
        symbols: [{ name: "ClientError", shape: { type: "enum-with-associated-values" } }]
    },
    FormFile: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "FormFile",
        symbols: [{ name: "FormFile", shape: { type: "struct" } }]
    },
    JsonValue: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "JSONValue",
        symbols: [{ name: "JSONValue", shape: { type: "enum-with-associated-values" } }]
    },
    Nullable: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "Nullable",
        symbols: [{ name: "Nullable", shape: { type: "enum-with-associated-values" } }]
    },
    RequestOptions: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "RequestOptions",
        symbols: [{ name: "RequestOptions", shape: { type: "struct" } }]
    }
} satisfies Record<string, AsIsFileSpec<AsIsSymbolName>>;
