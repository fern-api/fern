import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { entries } from "@fern-api/core-utils";

export const AsIsFileNames = {
    // Core/Networking
    Http: "HTTP.swift",
    HttpClient: "HTTPClient.swift",
    QueryParameter: "QueryParameter.swift",

    // Core/Serde
    DecoderPlusAdditionalProperties: "Decoder+AdditionalProperties.swift",
    EncoderPlusAdditionalProperties: "Encoder+AdditionalProperties.swift",
    Serde: "Serde.swift",
    StringKey: "StringKey.swift",

    // Core
    Prelude: "Prelude.swift",
    StringPlusUrlEncoding: "String+URLEncoding.swift",

    // Public
    APIErrorResponse: "APIErrorResponse.swift",
    ClientConfig: "ClientConfig.swift",
    ClientError: "ClientError.swift",
    JsonValue: "JSONValue.swift",
    RequestOptions: "RequestOptions.swift"
};

export interface AsIsFileDefinition {
    filename: string;
    loadContents: () => Promise<string>;
}

export type AsIsFileId = keyof typeof AsIsFileNames;

export type AsIsFileDefinitionsById = {
    [K in AsIsFileId]: AsIsFileDefinition;
};

export const AsIsFiles = createAsIsFiles();

function createAsIsFiles(): AsIsFileDefinitionsById {
    const result = {} as AsIsFileDefinitionsById;

    for (const [key, filename] of entries(AsIsFileNames)) {
        result[key] = {
            filename,
            loadContents: () => {
                const absolutePath = resolve(__dirname, "../../asIs", filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
