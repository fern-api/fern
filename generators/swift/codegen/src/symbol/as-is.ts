import type { TypeSymbolShape } from "./symbol-registry";

export type AsIsSymbolName =
    | "JSONValue"
    | "CalendarDate"
    | "HTTP"
    | "MultipartFormData"
    | "MultipartFormDataConvertible"
    | "MultipartFormField"
    | "QueryParameter"
    | "EncodableValue"
    | "Serde"
    | "StringKey"
    | "ClientConfig"
    | "FormFile"
    | "HTTPError"
    | "Nullable"
    | "RequestOptions"
    | "Networking"
    | "Indirect";

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
export const SourceAsIsFileSpecs: {
    Http: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "HTTP"; shape: { type: "enum-container" } }>;
    };
    MultipartFormData: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "MultipartFormData"; shape: { type: "class" } }>;
    };
    MultipartFormDataConvertible: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "MultipartFormDataConvertible"; shape: { type: "protocol" } }>;
    };
    MultipartFormField: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "MultipartFormField"; shape: { type: "enum-with-associated-values" } }>;
    };
    QueryParameter: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "QueryParameter"; shape: { type: "enum-with-associated-values" } }>;
    };
    DecoderPlusAdditionalProperties: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<never>;
    };
    EncodableValue: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "EncodableValue"; shape: { type: "struct" } }>;
    };
    EncoderPlusAdditionalProperties: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<never>;
    };
    JSONEncoderPlusEncodableValue: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<never>;
    };
    KeyedDecodingContainerPlusNullable: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<never>;
    };
    KeyedEncodingContainerPlusNullable: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<never>;
    };
    Serde: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "Serde"; shape: { type: "class" } }>;
    };
    StringKey: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "StringKey"; shape: { type: "struct" } }>;
    };
    DataPlusString: { relativePathToDir: string; filenameWithoutExtension: string; symbols: Array<never> };
    StringPlusUrlEncoding: { relativePathToDir: string; filenameWithoutExtension: string; symbols: Array<never> };
    CalendarDate: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "CalendarDate"; shape: { type: "struct" } }>;
    };
    ClientConfig: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "ClientConfig"; shape: { type: "class" } }>;
    };
    FormFile: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "FormFile"; shape: { type: "struct" } }>;
    };
    HTTPError: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "HTTPError"; shape: { type: "struct" } }>;
    };
    Indirect: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "Indirect"; shape: { type: "class" } }>;
    };
    JsonValue: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "JSONValue"; shape: { type: "enum-with-associated-values" } }>;
    };
    Networking: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "Networking"; shape: { type: "enum-container" } }>;
    };
    Nullable: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "Nullable"; shape: { type: "enum-with-associated-values" } }>;
    };
    RequestOptions: {
        relativePathToDir: string;
        filenameWithoutExtension: string;
        symbols: Array<{ name: "RequestOptions"; shape: { type: "struct" } }>;
    };
} = {
    // Core/Networking
    Http: {
        relativePathToDir: "Core/Networking",
        filenameWithoutExtension: "HTTP",
        symbols: [{ name: "HTTP", shape: { type: "enum-container" } }]
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
    CalendarDate: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "CalendarDate",
        symbols: [{ name: "CalendarDate", shape: { type: "struct" } }]
    },
    ClientConfig: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "ClientConfig",
        symbols: [{ name: "ClientConfig", shape: { type: "class" } }]
    },
    FormFile: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "FormFile",
        symbols: [{ name: "FormFile", shape: { type: "struct" } }]
    },
    HTTPError: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "HTTPError",
        symbols: [{ name: "HTTPError", shape: { type: "struct" } }]
    },
    Indirect: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "Indirect",
        symbols: [{ name: "Indirect", shape: { type: "class" } }]
    },
    JsonValue: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "JSONValue",
        symbols: [{ name: "JSONValue", shape: { type: "enum-with-associated-values" } }]
    },
    Networking: {
        relativePathToDir: "Public",
        filenameWithoutExtension: "Networking",
        symbols: [{ name: "Networking", shape: { type: "enum-container" } }]
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
